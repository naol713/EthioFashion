import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/layout/container';
import { LayoutDashboard, Package, Boxes, ShoppingCart, Users, Ticket, Star, FileText, Settings, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/categories', label: 'Categories', icon: Package },
  { href: '/admin/products/brands', label: 'Brands', icon: Store },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="flex items-center gap-3 mb-8">
          <Store className="h-6 w-6 text-[#D4AF37]" />
          <div><p className="text-sm text-gray-500">EthioFashion</p><h1 className="text-2xl font-bold">Admin console</h1></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-2 h-fit">
            <nav className="space-y-1">
              {navigation.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0a0a0a]">
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="lg:col-span-4">{children}</main>
        </div>
      </Container>
    </div>
  );
}