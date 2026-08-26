"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "./container";
import { ShoppingBag, Search, User, Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Shop All", href: "/products" },
  {
    name: "Men",
    href: "/products?gender=MALE",
    children: [
      {
        name: "Men's Clothing",
        href: "/products?gender=MALE&category=mens-clothing",
      },
      { name: "Men's Shoes", href: "/products?gender=MALE&category=shoes" },
    ],
  },
  {
    name: "Women",
    href: "/products?gender=FEMALE",
    children: [
      {
        name: "Women's Dresses",
        href: "/products?gender=FEMALE&category=womens-dresses-tops",
      },
      { name: "Traditional", href: "/products?gender=FEMALE" },
    ],
  },
  { name: "Shoes", href: "/products?category=shoes" },
  {
    name: "Support",
    href: "/contact",
    children: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns & Exchanges", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    name: "Company",
    href: "/about",
    children: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/about#story" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Authentication screens are self-contained panels, not storefront pages.
  if (
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(
      pathname,
    )
  ) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-white border-b border-gray-100",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="EthioFashion"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
              priority
            />
            <span className="font-bold text-[#0a0a0a] text-lg tracking-tight hidden sm:block">
              EthioFashion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() =>
                  item.children && setActiveDropdown(item.name)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-100",
                  )}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 pt-2 z-50 animate-fadeIn">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[200px]">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search bar (expandable) */}
            {searchOpen ? (
              <div className="flex items-center gap-2 animate-slideDown">
                <form
                  action="/products"
                  method="get"
                  className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
                >
                  <input
                    id="header-search-input"
                    name="q"
                    type="text"
                    autoFocus
                    placeholder="Search products…"
                    className="px-3 py-1.5 text-sm outline-none w-40 bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1.5 text-gray-500 hover:text-[#0a0a0a]"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-9 w-9 text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-100"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Account */}
            <Link href="/account" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-100"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Admin Dashboard button — only visible to admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 ml-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#f0cc5a] text-[#0a0a0a] text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 border border-[#b8962e]/30"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-100"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {/* Placeholder cart count badge */}
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center leading-none">
                  0
                </span>
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0a0a0a] hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="pl-4">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-3 py-2 text-xs text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/account">Account</Link>
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                asChild
              >
                <Link href="/cart">Cart (0)</Link>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
