'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function getCustomers() {
  await requireAdmin();
  return prisma.profiles.findMany({
    include: { _count: { select: { orders: true, addresses: true } }, user: { select: { role: true } } },
    orderBy: { created_at: 'desc' },
  });
}