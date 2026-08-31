'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getTotalProductCount } from '@/actions/products';

export async function getAdminDashboard() {
  await requireAdmin();
  const [orders, revenue, customers, products, lowStockResult, pendingOrders] = await Promise.all([
    prisma.orders.count(),
    prisma.orders.aggregate({ _sum: { total_amount: true }, where: { payment_status: 'PAID' } }),
    prisma.profiles.count(),
    getTotalProductCount(),
    // Count inventory records where available stock (quantity - reserved) is at or below the variant's own threshold
    prisma.$queryRaw<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count
      FROM inventory
      WHERE (quantity - reserved_quantity) <= low_stock_threshold
    `,
    prisma.orders.count({ where: { status: 'PENDING_PAYMENT' } }),
  ]);
  return {
    totalOrders: orders,
    totalRevenue: Number(revenue._sum.total_amount ?? 0),
    totalCustomers: customers,
    totalProducts: products,
    lowStockProducts: parseInt(lowStockResult[0]?.count ?? '0', 10),
    pendingOrders,
  };
}