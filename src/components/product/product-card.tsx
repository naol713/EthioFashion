'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';
import { toggleWishlist } from '@/actions/wishlist';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    short_description?: string | null;
    gender?: string | null;
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
    images?: Array<{ url: string; alt_text?: string | null }>;
    variants?: Array<{
      id: string;
      price: any;
      compare_at_price?: any;
      color?: { name: string; hex_code?: string | null } | null;
      size?: { name: string } | null;
    }>;
  };
  initialWishlisted?: boolean;
}

export function ProductCard({ product, initialWishlisted = false }: ProductCardProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage =
    (!imageError && product.images?.[0]?.url) ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
  const secondImage = product.images?.[1]?.url;

  const lowestVariant = product.variants?.[0];
  const minPrice = lowestVariant?.price ? Number(lowestVariant.price) : 0;
  const compareAtPrice = lowestVariant?.compare_at_price
    ? Number(lowestVariant.compare_at_price)
    : null;
  const hasDiscount = compareAtPrice && compareAtPrice > minPrice;
  const discountPct = hasDiscount
    ? Math.round(((compareAtPrice - minPrice) / compareAtPrice) * 100)
    : 0;

  const colors = product.variants
    ?.map(v => v.color)
    .filter(Boolean)
    .filter((c, i, arr) => arr.findIndex(x => x?.name === c?.name) === i)
    .slice(0, 5);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Image area */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex-shrink-0">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            'object-cover object-center transition-all duration-500',
            secondImage ? 'group-hover:opacity-0' : 'group-hover:scale-105',
          )}
          onError={() => setImageError(true)}
        />
        {/* Hover second image */}
        {secondImage && (
          <Image
            src={secondImage}
            alt={`${product.name} - alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border-0">
              -{discountPct}%
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={async e => {
            e.preventDefault();
            e.stopPropagation();
            if (wishlistLoading) return;

            const nextWishlisted = !wishlisted;
            setWishlistLoading(true);
            setWishlisted(nextWishlisted);

            const result = await toggleWishlist(product.id);
            if (!result.success) {
              setWishlisted(!nextWishlisted);
              if (result.error === 'Not authenticated') {
                router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
                setWishlistLoading(false);
                return;
              }
            } else {
              router.refresh();
            }
            setWishlistLoading(false);
          }}
          disabled={wishlistLoading}
          className={cn(
            'absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            wishlisted
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-sm',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-1.5 p-2 bg-white/95 backdrop-blur-sm">
            <Button
              size="sm"
              className="flex-1 h-9 text-xs bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white rounded-xl"
              asChild
            >
              <Link href={`/products/${product.slug}`}>
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Add to Cart
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl border-gray-200"
              asChild
            >
              <Link href={`/products/${product.slug}`} aria-label="Quick view">
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm text-[#0a0a0a] line-clamp-1 hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short description */}
        {product.short_description && (
          <p className="text-xs text-gray-400 line-clamp-1">{product.short_description}</p>
        )}

        {/* Color swatches */}
        {colors && colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {colors.map(color => (
              <div
                key={color!.name}
                title={color!.name}
                className="h-3.5 w-3.5 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: color!.hex_code || '#ccc' }}
              />
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-[#0a0a0a]">
              {minPrice.toLocaleString()} ETB
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {compareAtPrice!.toLocaleString()} ETB
              </span>
            )}
          </div>
          {product.category && (
            <span className="text-[10px] text-gray-400">{product.category.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
