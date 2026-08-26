import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductBySlug, getProducts } from '@/actions/products';
import { getWishlist } from '@/actions/wishlist';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ProductGallery } from '@/components/product/product-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { ProductCard } from '@/components/product/product-card';
import { ArrowLeft, Star, Package, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (!result.success || !result.data) {
    return { title: 'Product Not Found' };
  }
  const p = result.data as any;
  return {
    title: p.name,
    description: p.short_description || p.description?.slice(0, 155),
    openGraph: {
      title: p.name,
      description: p.short_description || '',
      images: p.images?.[0]?.url ? [{ url: p.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data as any;
  const wishlistRes = await getWishlist();
  const wishlistedIds = new Set(
    wishlistRes.success ? wishlistRes.items.map((item: any) => item.product_id) : [],
  );
  const clientProduct = {
    ...product,
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: Number(variant.price),
      compare_at_price: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
      cost_price: variant.cost_price == null ? null : Number(variant.cost_price),
      weight: variant.weight == null ? null : Number(variant.weight),
    })),
  };

  // Load related products (same category, exclude current)
  const relatedRes = await getProducts({
    categorySlug: product.category?.slug,
    limit: 4,
  }).catch(() => ({ data: [] }));
  const relatedProducts = ((relatedRes as any).data || [])
    .filter((p: any) => p.slug !== product.slug)
    .slice(0, 4)
    .map((p: any) => ({
      ...p,
      variants: p.variants?.map((variant: any) => ({
        ...variant,
        price: Number(variant.price),
        compare_at_price: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
        cost_price: variant.cost_price == null ? null : Number(variant.cost_price),
        weight: variant.weight == null ? null : Number(variant.weight),
      })),
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#0a0a0a] transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-[#0a0a0a] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#0a0a0a] font-medium">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-sm">
          {/* Gallery */}
          <ProductGallery images={product.images || []} productName={product.name} />

          {/* Product info + variant selector */}
          <div className="space-y-5">
            {/* Brand + badges */}
            <div className="flex items-center justify-between">
              {product.brand && (
                <Link
                  href={`/products?brand=${product.brand.slug}`}
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] hover:text-[#0a0a0a] transition-colors"
                >
                  {product.brand.name}
                </Link>
              )}
              <div className="flex items-center gap-2">
                {product.featured && (
                  <Badge className="bg-[#D4AF37] text-black text-[10px] border-0 font-bold">
                    Featured
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="secondary" className="text-[10px]">
                    {product.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Product name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0a0a0a] leading-tight">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="text-gray-500 mt-2 text-sm">{product.short_description}</p>
              )}
            </div>

            {/* Review stars (placeholder for Phase 4+) */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Variant selector — the interactive client component */}
            <VariantSelector
              variants={clientProduct.variants || []}
              productName={clientProduct.name}
              productId={clientProduct.id}
              initialWishlisted={wishlistedIds.has(clientProduct.id)}
            />

            {/* Description */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h2 className="font-semibold text-sm text-[#0a0a0a]">Product Description</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {product.material && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Package className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[#0a0a0a] block">Material</span>
                    {product.material}
                  </span>
                </div>
              )}
              {product.gender && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Tag className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[#0a0a0a] block">Gender</span>
                    {product.gender === 'MALE' ? "Men's" : product.gender === 'FEMALE' ? "Women's" : 'Unisex'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-sm text-[#0a0a0a]">
                        {review.user?.first_name} {review.user?.last_name}
                      </p>
                      <div className="flex text-[#D4AF37] mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-ET')}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-sm text-[#0a0a0a] mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-500 leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0a0a0a]">You Might Also Like</h2>
              <Link
                href={`/products?category=${product.category?.slug || ''}`}
                className="text-sm text-[#D4AF37] hover:text-[#0a0a0a] transition-colors font-medium flex items-center gap-1"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  initialWishlisted={wishlistedIds.has(p.id)}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
