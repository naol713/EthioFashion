'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function getReviews() {
  await requireAdmin();
  return prisma.reviews.findMany({ include: { product: true, user: true }, orderBy: { created_at: 'desc' } });
}

export async function moderateReview(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
  await requireAdmin();
  await prisma.reviews.update({ where: { id }, data: { status } });
  revalidatePath('/admin/reviews');
  revalidatePath('/products');
  return { success: true };
}