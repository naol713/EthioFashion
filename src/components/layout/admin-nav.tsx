import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

/**
 * Server component — renders a slim admin bar below the header, only for ADMIN users.
 */
export async function AdminNav() {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') return null;

    return (
      <div className="w-full bg-[#0a0a0a] text-white py-2 px-4 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Admin mode — logged in as <span className="text-[#D4AF37] font-medium">{user.email}</span>
        </span>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37] text-[#0a0a0a] font-semibold hover:bg-[#c9a42e] transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Admin Dashboard
        </Link>
      </div>
    );
  } catch {
    return null;
  }
}
