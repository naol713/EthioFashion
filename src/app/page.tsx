import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { Footer } from '@/components/layout/footer';
import { PremiumHero } from '@/components/home/premium-hero';
import { getFeaturedProducts } from '@/actions/products';
import { getCategories } from '@/actions/categories';
import { getWishlist } from '@/actions/wishlist';
import { ProductCard } from '@/components/product/product-card';
import { prisma } from '@/lib/db/prisma';
import { ArrowRight, Heart, ShoppingBag, Users } from 'lucide-react';

export default async function Home() {
  const [featuredRes, categoriesRes, productCount, customerCount] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
    prisma.products.count({ where: { deleted_at: null } }),
    prisma.profiles.count(),
  ]);
  const wishlistRes = await getWishlist();

  const featuredProducts = Array.isArray(featuredRes.data)
    ? featuredRes.data.map((product: any) => ({
        ...product,
        variants: product.variants?.map((variant: any) => ({
          ...variant,
          price: Number(variant.price),
          compare_at_price: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
          cost_price: variant.cost_price == null ? null : Number(variant.cost_price),
          weight: variant.weight == null ? null : Number(variant.weight),
        })),
      }))
    : [];
  const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data.slice(0, 4) : [];
  const wishlistedIds = new Set(
    wishlistRes.success ? wishlistRes.items.map((item: any) => item.product_id) : [],
  );

  const heroCategories = [
    {
      name: "Men's Collection",
      href: '/products?gender=MALE',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      badge: 'New Season',
    },
    {
      name: "Women's Collection",
      href: '/products?gender=FEMALE',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      badge: 'Trending',
    },
    {
      name: 'Shoes & Boots',
      href: '/products?category=shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      badge: 'Premium Craft',
    },
  ];

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <PremiumHero />

      {/* ─── SHOP BY CATEGORY ─────────────────────────────────── */}
      <section className="py-20 bg-[#fafafa]">
        <Container>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
              Explore
            </p>
            <h2 className="text-4xl font-bold text-[#0a0a0a]">Shop by Category</h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Curated collections of premium Ethiopian fashion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroCategories.map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 block"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-[#D4AF37] text-black text-[10px] font-bold tracking-widest uppercase mb-2 border-0">
                    {cat.badge}
                  </Badge>
                  <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
                  Hand-picked
                </p>
                <h2 className="text-4xl font-bold text-[#0a0a0a]">Featured Collection</h2>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white">
                <Link href="/products?featured=true">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialWishlisted={wishlistedIds.has(product.id)}
                />
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/products?featured=true">View All Products</Link>
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* ─── BRANDS / STORY BANNER ────────────────────────────── */}
      <section className="bg-[#fafafa] py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-xl">
              <p className="flex items-center gap-4 text-[13px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                Our Story
                <span className="h-px w-14 bg-[#D4AF37]/70" />
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] text-[#0a0a0a] sm:text-5xl lg:text-6xl">
                Crafted in Ethiopia,
                <span className="block text-[#D4AF37]">Made for the World</span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
                We partner with Ethiopian artisans, weavers, and shoemakers to bring you
                authentic, high-quality fashion that celebrates our culture while meeting modern
                standards of quality and design.
              </p>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { value: '50+', label: 'Local Artisans', icon: Users },
                    { value: `${productCount}+`, label: 'Products', icon: ShoppingBag },
                    { value: customerCount >= 1000 ? `${(customerCount / 1000).toFixed(1).replace(/\.0$/, '')}K+` : `${customerCount}+`, label: 'Happy Customers', icon: Heart },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={label} className="pr-4 last:pr-0">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-black tracking-tight text-[#0a0a0a] sm:text-3xl">
                        {value}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Button
                  className="h-12 rounded-full bg-[#D4AF37] px-6 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(212,175,55,0.22)] hover:bg-[#f1c94b]"
                  asChild
                >
                  <Link href="/products">
                    Explore All Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] sm:row-span-2">
          <Image
            src="https://cdn.shopify.com/s/files/1/0559/4280/7726/files/maria-fernanda-pissioli-DTZV8WDM1Ho-unsplash_1_2048x2048.jpg?v=1691669493"
            alt="Premium Ethiopian fashion look"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
        <div className="relative min-h-[13rem] overflow-hidden rounded-[2rem]">
          <Image
            src="https://i.pinimg.com/474x/ae/75/09/ae7509020527bec51294a1a1d40035ba.jpg"
            alt="Premium tailored Ethiopian clothing"
            fill
            className="object-contain bg-white scale-[1.06]"
            sizes="(max-width: 1024px) 100vw, 22vw"
          />
        </div>
        <div className="relative min-h-[13rem] overflow-hidden rounded-[2rem]">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2yS_c616j0f4iyk1lByrVn8K3UdVtNk9jk5l70niKgrvRSup0lPDH2Azm&s=10"
            alt="High-end premium footwear"
            fill
            className="object-contain bg-white scale-[1.06]"
            sizes="(max-width: 1024px) 100vw, 22vw"
          />
        </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── PAYMENT METHODS ──────────────────────────────────── */}
      <section className="py-10 bg-[#fafafa] border-t">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
              Accepted Payment Methods
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {['Telebirr', 'Chapa', 'CBE Birr', 'Bank of Abyssinia'].map(method => (
                <div
                  key={method}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
    <Footer />
    </>
  );
}
