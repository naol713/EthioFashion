import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/layout/container';
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/account', icon: User },
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  async function handleSignOut() {
    'use server';
    const { signOut } = await import('@/lib/auth');
    await signOut();
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* User info header */}
              <div className="p-6 bg-[#0a0a0a] text-white">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <span className="text-[#0a0a0a] font-bold text-lg">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-300">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}

                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
