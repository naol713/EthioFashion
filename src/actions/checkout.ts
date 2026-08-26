'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getPaymentProvider } from '@/lib/payments';
import type { PaymentMethod } from '@/types';

const paymentMethods = ['TELEBIRR', 'CHAPA', 'CBE_BANK', 'ABAY_BANK'] as const;

const checkoutSchema = z.object({
  addressId: z.string().uuid('Select a delivery address'),
  couponCode: z.string().trim().max(32).optional(),
  paymentMethod: z.enum(paymentMethods),
  customerNote: z.string().trim().max(500).optional(),
});

export async function validateCoupon(code: string, subtotal: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return { success: false, error: 'Enter a coupon code' };

  try {
    const coupon = await prisma.coupons.findUnique({ where: { code: normalizedCode } });
    const now = new Date();
    if (!coupon || !coupon.is_active || (coupon.starts_at && coupon.starts_at > now) || (coupon.expires_at && coupon.expires_at < now)) {
      return { success: false, error: 'Coupon is invalid or expired' };
    }
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return { success: false, error: 'Coupon usage limit reached' };
    }
    if (coupon.minimum_order_amount !== null && subtotal < Number(coupon.minimum_order_amount)) {
      return { success: false, error: `Minimum order is ${Number(coupon.minimum_order_amount).toLocaleString()} ETB` };
    }

    const rawDiscount = coupon.discount_type === 'PERCENTAGE'
      ? subtotal * Number(coupon.discount_value) / 100
      : Number(coupon.discount_value);
    const discount = Math.min(rawDiscount, Number(coupon.maximum_discount ?? rawDiscount), subtotal);
    return { success: true, code: coupon.code, discount };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { success: false, error: 'Unable to validate coupon' };
  }
}

export async function createOrder(input: {
  addressId: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [cart, address] = await Promise.all([
        tx.carts.findUnique({
          where: { user_id: user.id },
          include: {
            items: {
              include: {
                variant: { include: { product: true, color: true, size: true, inventory: true } },
              },
            },
          },
        }),
        tx.addresses.findFirst({ where: { id: parsed.data.addressId, user_id: user.id } }),
      ]);

      if (!cart || cart.items.length === 0) throw new Error('Your cart is empty');
      if (!address) throw new Error('Delivery address not found');

      const subtotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
      let discount = 0;
      let coupon: { id: string; code: string; discount: number } | null = null;

      if (parsed.data.couponCode) {
        const couponRecord = await tx.coupons.findUnique({ where: { code: parsed.data.couponCode.trim().toUpperCase() } });
        const now = new Date();
        if (!couponRecord || !couponRecord.is_active || (couponRecord.starts_at && couponRecord.starts_at > now) || (couponRecord.expires_at && couponRecord.expires_at < now)) {
          throw new Error('Coupon is invalid or expired');
        }
        if (couponRecord.usage_limit !== null && couponRecord.usage_count >= couponRecord.usage_limit) throw new Error('Coupon usage limit reached');
        if (couponRecord.minimum_order_amount !== null && subtotal < Number(couponRecord.minimum_order_amount)) throw new Error('Minimum order amount not reached');
        const rawDiscount = couponRecord.discount_type === 'PERCENTAGE' ? subtotal * Number(couponRecord.discount_value) / 100 : Number(couponRecord.discount_value);
        discount = Math.min(rawDiscount, Number(couponRecord.maximum_discount ?? rawDiscount), subtotal);
        coupon = { id: couponRecord.id, code: couponRecord.code, discount };
      }

      for (const item of cart.items) {
        const inventory = item.variant.inventory;
        const available = (inventory?.quantity ?? 0) - (inventory?.reserved_quantity ?? 0);
        if (!inventory || available < item.quantity) throw new Error(`${item.variant.product.name} is out of stock`);
        await tx.inventory.update({ where: { id: inventory.id }, data: { reserved_quantity: { increment: item.quantity } } });
      }

      const deliveryFee = subtotal - discount > 1000 ? 0 : 50;
      const total = subtotal - discount + deliveryFee;
      const orderNumber = `EF-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      const payment = await getPaymentProvider(parsed.data.paymentMethod).initialize({
        orderId: orderNumber,
        orderNumber,
        amount: total,
        currency: 'ETB',
        customerEmail: user.email,
        customerPhone: address.phone,
      });

      const order = await tx.orders.create({
        data: {
          order_number: orderNumber,
          user_id: user.id,
          address_id: address.id,
          subtotal,
          discount_amount: discount,
          delivery_fee: deliveryFee,
          total_amount: total,
          shipping_address_snapshot: {
            label: address.label,
            recipientName: address.recipient_name,
            phone: address.phone,
            region: address.region,
            city: address.city,
            subCity: address.sub_city,
            woreda: address.woreda,
            streetAddress: address.street_address,
            building: address.building,
            additionalInfo: address.additional_info,
          },
          customer_note: parsed.data.customerNote || null,
          items: {
            create: cart.items.map((item) => ({
              product_id: item.variant.product_id,
              variant_id: item.variant.id,
              product_name_snapshot: item.variant.product.name,
              sku_snapshot: item.variant.sku,
              size_snapshot: item.variant.size?.name,
              color_snapshot: item.variant.color?.name,
              unit_price: item.variant.price,
              quantity: item.quantity,
              subtotal: Number(item.variant.price) * item.quantity,
            })),
          },
          payment: {
            create: {
              method: parsed.data.paymentMethod,
              amount: total,
              reference: payment.reference,
              status: 'PENDING',
            },
          },
          status_history: { create: { to_status: 'PENDING_PAYMENT', note: 'Order created' } },
        },
      });

      for (const item of cart.items) {
        const inventory = item.variant.inventory!;
        await tx.inventory_transactions.create({
          data: {
            variant_id: inventory.id,
            type: 'RESERVATION',
            quantity: item.quantity,
            previous_quantity: inventory.quantity,
            new_quantity: inventory.quantity,
            reference_type: 'ORDER',
            reference_id: order.id,
            created_by: user.id,
          },
        });
      }

      if (coupon) {
        await tx.coupons.update({ where: { id: coupon.id }, data: { usage_count: { increment: 1 } } });
        await tx.coupon_usage.create({ data: { coupon_id: coupon.id, user_id: user.id, order_id: order.id, discount_amount: coupon.discount } });
      }

      await tx.carts.update({ where: { id: cart.id }, data: { status: 'CONVERTED', items: { deleteMany: {} } } });
      return { orderId: order.id, orderNumber: order.order_number, totalAmount: total, paymentReference: payment.reference };
    });

    revalidatePath('/cart');
    revalidatePath('/account/orders');
    return { success: true, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order';
    console.error('Error creating order:', error);
    return { success: false, error: message };
  }
}