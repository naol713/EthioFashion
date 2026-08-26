'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

const couponSchema = z.object({
  code: z.string().trim().min(3).max(32),
  description: z.string().trim().max(200).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.coerce.number().positive(),
  minimumOrderAmount: z.coerce.number().nonnegative().optional(),
  maximumDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
});

export async function getCoupons() {
  await requireAdmin();
  return prisma.coupons.findMany({ orderBy: { created_at: 'desc' } });
}

export async function createCoupon(input: unknown) {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    const coupon = await prisma.coupons.create({ data: {
      code: parsed.data.code.toUpperCase(), description: parsed.data.description || null,
      discount_type: parsed.data.discountType, discount_value: parsed.data.discountValue,
      minimum_order_amount: parsed.data.minimumOrderAmount ?? null, maximum_discount: parsed.data.maximumDiscount ?? null,
      usage_limit: parsed.data.usageLimit ?? null,
    } });
    revalidatePath('/admin/coupons');
    return { success: true, coupon };
  } catch { return { success: false, error: 'Coupon code already exists or is invalid' }; }
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupons.update({ where: { id }, data: { is_active: isActive } });
  revalidatePath('/admin/coupons');
  return { success: true };
}