import Link from 'next/link';
import { getAdminDashboard } from '@/actions/admin/dashboard';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboard();
  const cards = [
    ['Orders', stats.totalOrders, '/admin/orders'],
    ['Revenue', `${stats.totalRevenue.toLocaleString()} ETB`, '/admin/orders'],
    ['Customers', stats.totalCustomers, '/admin/customers'],
    ['Products', stats.totalProducts, '/admin/products'],
    ['Low stock', stats.lowStockProducts, '/admin/inventory'],
    ['Pending orders', stats.pendingOrders, '/admin/orders'],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">Dashboard</h2><p className="text-gray-600 mt-1">Store operations at a glance.</p></div><Button asChild variant="outline"><Link href="/products">View storefront</Link></Button></div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(([label, value, href]) => <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#D4AF37]"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></Link>)}
      </div>
    </div>
  );
}