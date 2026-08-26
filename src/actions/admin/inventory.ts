'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { adjustInventory } from '@/lib/inventory';

export async function getInventory() {
  await requireAdmin();
  return prisma.inventory.findMany({
    include: { variant: { include: { product: true, color: true, size: true } } },
    orderBy: { updated_at: 'desc' },
  });
}

export async function adjustAdminInventory(variantId: string, quantityChange: number, note?: string) {
  const admin = await requireAdmin();
  if (!Number.isInteger(quantityChange) || quantityChange === 0) return { success: false, error: 'Enter a non-zero whole number' };
  try {
    await adjustInventory({ variantId, quantityChange, type: quantityChange > 0 ? 'RESTOCK' : 'ADJUSTMENT', note, createdBy: admin.id });
    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return { success: false, error: 'Failed to adjust inventory' };
  }
}