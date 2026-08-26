'use server';

import { prisma } from '@/lib/db/prisma';
import { SizeType } from '@prisma/client';

export async function getColors() {
  try {
    const colors = await prisma.colors.findMany({
      orderBy: { name: 'asc' },
    }).catch(() => []);

    return { success: true, data: colors };
  } catch (error: any) {
    console.error('Error fetching colors:', error);
    return { success: false, error: error.message || 'Failed to fetch colors' };
  }
}

export async function getSizes(type?: SizeType) {
  try {
    const where = type ? { type } : {};
    const sizes = await prisma.sizes.findMany({
      where,
      orderBy: { sort_order: 'asc' },
    }).catch(() => []);

    return { success: true, data: sizes };
  } catch (error: any) {
    console.error('Error fetching sizes:', error);
    return { success: false, error: error.message || 'Failed to fetch sizes' };
  }
}
