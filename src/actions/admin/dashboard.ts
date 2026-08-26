'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function getAdminDashboard() {
  await requireAdmin();
  const [orders, revenue, customers, products, lowStock, pendingOrders] = await Promise.all([
    prisma.orders.count(),
    prisma.orders.aggregate({ _sum: { total_amount: true }, where: { payment_status: 'PAID' } }),
    prisma.profiles.count(),
    prisma.products.count(),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.orders.count({ where: { status: 'PENDING_PAYMENT' } }),
  ]);
  return {
    totalOrders: orders,
    totalRevenue: Number(revenue._sum.total_amount ?? 0),
    totalCustomers: customers,
    totalProducts: products,
    lowStockProducts: lowStock,
    pendingOrders,
  };
}