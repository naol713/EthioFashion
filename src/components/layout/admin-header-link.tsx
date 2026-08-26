'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export function AdminHeaderLink() {
  return (
    <Link
      href="/admin"
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#D4AF37] text-[#0a0a0a] hover:bg-[#c9a42e] transition-colors"
    >
      <LayoutDashboard className="h-4 w-4" />
      Admin
    </Link>
  );
}
