import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getOrders } from '@/actions/orders';
import { getAddresses } from '@/actions/addresses';
import { getWishlistCount } from '@/actions/wishlist';
import {
  Package,
  Heart,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default async function AccountDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  const [ordersResult, addressesResult, wishlistCount] = await Promise.all([
    getOrders(),
    getAddresses(),
    getWishlistCount(),
  ]);
  const allOrders = ordersResult.data;
  const recentOrders = allOrders.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your account, track orders, and more.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <Package className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{recentOrders.length}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{wishlistCount}</p>
              <p className="text-xs text-gray-500">Wishlist</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{addressesResult.addresses.length}</p>
              <p className="text-xs text-gray-500">Addresses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{allOrders.filter((order) => {
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                return order.created_at >= monthStart;
              }).length}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0a0a0a]">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm text-[#D4AF37] hover:text-[#0a0a0a] font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-4 text-[#D4AF37] hover:text-[#0a0a0a] font-medium"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order items would go here */}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/account/addresses"
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-[#D4AF37] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
              <MapPin className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0a0a0a]">Manage Addresses</h3>
              <p className="text-sm text-gray-500">Add or update delivery addresses</p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-[#D4AF37] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
              <Heart className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0a0a0a]">Your Wishlist</h3>
              <p className="text-sm text-gray-500">Save items for later</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}