import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth';
import type { DeliveryStatus, OrderStatus } from '@/types';

export async function getOrders() {
  const user = await getCurrentUser();
  if (!user) return { success: false, data: [] };

  try {
    const data = await prisma.orders.findMany({
      where: { user_id: user.id },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, data: [] };
  }
}

export async function getOrderByNumberAdmin(orderNumber: string) {
  await requireAdmin();

  try {
    const order = await prisma.orders.findFirst({
      where: { order_number: orderNumber },
      include: {
        user: true,
        items: true,
        payment: true,
        address: true,
        status_history: { orderBy: { created_at: 'asc' } },
      },
    });
    return order ? { success: true, order } : { success: false, error: 'Order not found', order: null };
  } catch (error) {
    console.error('Error fetching order (admin):', error);
    return { success: false, error: 'Failed to fetch order', order: null };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', order: null };

  try {
    const order = await prisma.orders.findFirst({
      where: { order_number: orderNumber, user_id: user.id },
      include: { items: true, payment: true, status_history: { orderBy: { created_at: 'asc' } } },
    });
    return order ? { success: true, order } : { success: false, error: 'Order not found', order: null };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: 'Failed to fetch order', order: null };
  }
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const deliveryStatusByOrderStatus: Partial<Record<OrderStatus, DeliveryStatus>> = {
  CONFIRMED: 'PREPARING',
  PROCESSING: 'PREPARING',
  READY_FOR_DELIVERY: 'READY',
  OUT_FOR_DELIVERY: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'FAILED',
};

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string) {
  const admin = await requireAdmin();

  try {
    const current = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!current) return { success: false, error: 'Order not found' };
    if (!allowedTransitions[current.status].includes(nextStatus)) {
      return { success: false, error: `Cannot move order from ${current.status} to ${nextStatus}` };
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.orders.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          delivery_status: deliveryStatusByOrderStatus[nextStatus],
          payment_status: nextStatus === 'PAID' ? 'PAID' : undefined,
          status_history: {
            create: { from_status: current.status, to_status: nextStatus, changed_by: admin.id, note: note || null },
          },
        },
      });
      return updated;
    });

    return { success: true, order };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}