import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/actions/products';
import { getCategories } from '@/actions/categories';
import { getBrands } from '@/actions/brands';
import { getWishlist } from '@/actions/wishlist';
import { Container } from '@/components/layout/container';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGender } from '@prisma/client';
import { SlidersHorizontal, LayoutGrid, ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse premium Ethiopian fashion — clothing, shoes, and accessories.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    gender?: string;
    sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc';
    q?: string;
    page?: string;
  }>;
}

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const genderOptions = [
  { label: 'All', value: undefined },
  { label: 'Men', value: 'MALE' },
  { label: 'Women', value: 'FEMALE' },
  { label: 'Unisex', value: 'UNISEX' },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = await searchParams;

  const categorySlug = resolved.category;
  const brandSlug = resolved.brand;
  const gender = resolved.gender as ProductGender | undefined;
  const sortBy = (resolved.sort as any) || 'featured';
  const query = resolved.q;
  const page = Number(resolved.page) || 1;

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    getProducts({ categorySlug, brandSlug, gender, sortBy, query, page, limit: 12 }),
    getCategories(),
    getBrands(),
  ]);
  const wishlistRes = await getWishlist();

  const products = ((productsRes.data || []) as any[]).map((product: any) => ({
    ...product,
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: Number(variant.price),
      compare_at_price: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
      cost_price: variant.cost_price == null ? null : Number(variant.cost_price),
      weight: variant.weight == null ? null : Number(variant.weight),
    })),
  }));
  const categories = (categoriesRes.data || []) as any[];
  const brands = (brandsRes.data || []) as any[];
  const pagination = (productsRes as any).pagination;
  const wishlistedIds = new Set(
    wishlistRes.success ? wishlistRes.items.map((item: any) => item.product_id) : [],
  );

  const activeFiltersCount = [categorySlug, brandSlug, gender, query].filter(Boolean).length;

  // Build URL helper for filter changes
  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const all = { category: categorySlug, brand: brandSlug, gender, sort: sortBy, q: query, ...overrides };
    Object.entries(all).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `/products?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page hero */}
      <div className="bg-[#0a0a0a] text-white py-12">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37] mb-2">
                Ethiopian Fashion
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold">
                {query ? `Results for "${query}"` : categorySlug ? 'Category' : 'All Products'}
              </h1>
              {pagination && (
                <p className="text-white/50 text-sm mt-1">
                  {pagination.total} item{pagination.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {/* Active filter badges */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {categorySlug && (
                  <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 gap-1.5 pr-1.5">
                    {categorySlug}
                    <Link href={buildUrl({ category: undefined })} className="hover:text-white ml-1 text-white/50">×</Link>
                  </Badge>
                )}
                {gender && (
                  <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 gap-1.5 pr-1.5">
                    {gender === 'MALE' ? 'Men' : gender === 'FEMALE' ? 'Women' : 'Unisex'}
                    <Link href={buildUrl({ gender: undefined })} className="hover:text-white ml-1 text-white/50">×</Link>
                  </Badge>
                )}
                {brandSlug && (
                  <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 gap-1.5 pr-1.5">
                    {brandSlug}
                    <Link href={buildUrl({ brand: undefined })} className="hover:text-white ml-1 text-white/50">×</Link>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="flex gap-8">
          {/* ─── SIDEBAR ─────────────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0 space-y-8">

            {/* Search */}
            <div>
              <form action="/products" method="get">
                <div className="relative">
                  <input
                    id="catalog-search"
                    name="q"
                    type="text"
                    defaultValue={query}
                    placeholder="Search products…"
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-[#0a0a0a] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label="Search"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Categories
              </h3>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href={buildUrl({ category: undefined })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!categorySlug ? 'bg-[#0a0a0a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0a0a0a]'}`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link
                      href={buildUrl({ category: cat.slug })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${categorySlug === cat.slug ? 'bg-[#0a0a0a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0a0a0a]'}`}
                    >
                      {cat.name}
                    </Link>
                    {cat.children?.length > 0 && (
                      <ul className="ml-4 mt-0.5 space-y-0.5">
                        {cat.children.map((sub: any) => (
                          <li key={sub.id}>
                            <Link
                              href={buildUrl({ category: sub.slug })}
                              className={`block px-3 py-1.5 rounded-lg text-xs transition-colors ${categorySlug === sub.slug ? 'bg-[#D4AF37]/20 text-[#0a0a0a] font-semibold' : 'text-gray-400 hover:bg-gray-100 hover:text-[#0a0a0a]'}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gender */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Gender
              </h3>
              <div className="flex flex-col gap-1">
                {genderOptions.map(g => (
                  <Link
                    key={g.label}
                    href={buildUrl({ gender: g.value })}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${gender === g.value || (!gender && !g.value) ? 'bg-[#0a0a0a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0a0a0a]'}`}
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Brands
                </h3>
                <ul className="space-y-0.5">
                  {brands.map((b: any) => (
                    <li key={b.id}>
                      <Link
                        href={buildUrl({ brand: b.slug })}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${brandSlug === b.slug ? 'bg-[#0a0a0a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0a0a0a]'}`}
                      >
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clear all */}
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/products">Clear All Filters</Link>
              </Button>
            )}
          </aside>

          {/* ─── MAIN CONTENT ────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {products.length} of {pagination?.total ?? products.length} products
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(opt => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ sort: opt.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${sortBy === opt.value ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filters (collapsible) */}
            <details className="lg:hidden mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none text-sm font-semibold text-[#0a0a0a]">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-[#D4AF37] text-black text-[10px] border-0 px-1.5">{activeFiltersCount}</Badge>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </summary>
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                <div className="pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gender</p>
                  <div className="flex flex-wrap gap-2">
                    {genderOptions.map(g => (
                      <Link
                        key={g.label}
                        href={buildUrl({ gender: g.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${gender === g.value || (!gender && !g.value) ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        {g.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {categories.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={buildUrl({ category: cat.slug })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${categorySlug === cat.slug ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">No products found</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Try adjusting your search or filters.
                </p>
                <Button asChild variant="outline">
                  <Link href="/products">Clear Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    initialWishlisted={wishlistedIds.has(product.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildUrl({ page: String(page - 1) })}>Previous</Link>
                  </Button>
                )}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className={p === page ? 'bg-[#0a0a0a] text-white' : ''}
                    asChild
                  >
                    <Link href={buildUrl({ page: String(p) })}>{p}</Link>
                  </Button>
                ))}
                {page < pagination.totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildUrl({ page: String(page + 1) })}>Next</Link>
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
