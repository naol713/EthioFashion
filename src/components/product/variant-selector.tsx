'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, ShieldCheck, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addToCart } from '@/actions/cart';
import { toggleWishlist } from '@/actions/wishlist';

interface Variant {
  id: string;
  sku: string;
  price: any;
  compare_at_price?: any;
  is_active?: boolean;
  color?: { name: string; hex_code?: string | null } | null;
  size?: { name: string; type?: string } | null;
  inventory?: { quantity: number; reserved_quantity: number; low_stock_threshold: number } | null;
}

interface VariantSelectorProps {
  variants: Variant[];
  productName: string;
  productId: string;
  initialWishlisted?: boolean;
}

export function VariantSelector({ variants, productName, productId, initialWishlisted = false }: VariantSelectorProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const price = selectedVariant?.price ? Number(selectedVariant.price) : 0;
  const compareAt = selectedVariant?.compare_at_price ? Number(selectedVariant.compare_at_price) : null;
  const hasDiscount = compareAt && compareAt > price;
  const discountPct = hasDiscount ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  // Stock status derived from inventory
  const inventory = selectedVariant?.inventory;
  const available = inventory ? Math.max(0, inventory.quantity - inventory.reserved_quantity) : 0;
  const isOutOfStock = !inventory || available === 0;
  const isLowStock = !isOutOfStock && inventory && available <= inventory.low_stock_threshold;

  // Group variants by color and size for display
  const uniqueColors = variants
    .map(v => v.color)
    .filter(Boolean)
    .filter((c, i, arr) => arr.findIndex(x => x?.name === c?.name) === i);

  const uniqueSizes = variants
    .map(v => v.size)
    .filter(Boolean)
    .filter((s, i, arr) => arr.findIndex(x => x?.name === s?.name) === i);

  // Active color & size from selected variant
  const activeColor = selectedVariant?.color?.name;
  const activeSize = selectedVariant?.size?.name;

  function selectByColorAndSize(colorName?: string, sizeName?: string) {
    const newColor = colorName ?? activeColor;
    const newSize = sizeName ?? activeSize;
    const match = variants.find(
      v => v.color?.name === newColor && v.size?.name === newSize,
    ) || variants.find(v => v.color?.name === newColor) || variants[0];
    if (match) setSelectedVariantId(match.id);
  }

  async function handleAddToCart() {
    setCartError('');
    const result = await addToCart(selectedVariantId, quantity);
    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
      router.refresh(); // update cart count in header
    } else {
      if (result.error === 'Not authenticated') {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else {
        setCartError(result.error || 'Failed to add to cart');
        setTimeout(() => setCartError(''), 3000);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Price block */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-[#0a0a0a]">
          {price.toLocaleString()} ETB
        </span>
        {hasDiscount && (
          <>
            <span className="text-xl text-gray-400 line-through">
              {compareAt!.toLocaleString()} ETB
            </span>
            <Badge className="bg-red-600 text-white border-0 font-bold text-xs">
              -{discountPct}% OFF
            </Badge>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2 text-sm">
        {isOutOfStock ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500 font-semibold">Out of Stock</span>
          </>
        ) : isLowStock ? (
          <>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-600 font-semibold">
              Only {available} left in stock!
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-semibold">In Stock</span>
          </>
        )}
        {selectedVariant?.sku && (
          <span className="text-gray-400 text-xs ml-auto">SKU: {selectedVariant.sku}</span>
        )}
      </div>

      {/* Color selector */}
      {uniqueColors.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#0a0a0a]">
            Color: <span className="font-normal text-gray-500">{activeColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map(color => (
              <button
                key={color!.name}
                title={color!.name}
                onClick={() => selectByColorAndSize(color!.name, undefined)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110',
                  activeColor === color!.name
                    ? 'border-[#0a0a0a] scale-110 shadow-md'
                    : 'border-transparent hover:border-gray-400',
                )}
                style={{ backgroundColor: color!.hex_code || '#ccc' }}
                aria-label={color!.name}
                aria-pressed={activeColor === color!.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {uniqueSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0a0a0a]">
              Size: <span className="font-normal text-gray-500">{activeSize}</span>
            </p>
            <button className="text-xs text-[#D4AF37] hover:underline font-medium">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map(size => {
              // Check if this size is in stock with the current color
              const matchVariant = variants.find(
                v => v.color?.name === activeColor && v.size?.name === size!.name,
              ) || variants.find(v => v.size?.name === size!.name);
              const sizeAvailable = matchVariant?.inventory
                ? matchVariant.inventory.quantity - matchVariant.inventory.reserved_quantity > 0
                : true;

              return (
                <button
                  key={size!.name}
                  onClick={() => selectByColorAndSize(undefined, size!.name)}
                  disabled={!sizeAvailable}
                  className={cn(
                    'h-10 min-w-[2.5rem] px-3 rounded-xl border text-sm font-medium transition-all duration-200',
                    activeSize === size!.name
                      ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-md'
                      : sizeAvailable
                      ? 'bg-white text-gray-700 border-gray-200 hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through',
                  )}
                  aria-pressed={activeSize === size!.name}
                >
                  {size!.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#0a0a0a]">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(available || 10, q + 1))}
              disabled={isOutOfStock}
              className="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {isOutOfStock ? 'Unavailable' : `${available} available`}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        {cartError && (
          <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-0 -mt-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {cartError}
          </div>
        )}

        <Button
          size="lg"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={cn(
            'flex-1 h-12 text-base font-semibold rounded-xl transition-all duration-300',
            addedToCart
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
          )}
        >
          {addedToCart ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={async () => {
            if (wishlistLoading) return;

            const nextWishlisted = !wishlisted;
            setWishlistLoading(true);
            setWishlisted(nextWishlisted);

            const result = await toggleWishlist(productId);
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
            'h-12 w-12 p-0 rounded-xl border-2 transition-all duration-200',
            wishlisted
              ? 'border-red-500 bg-red-50 text-red-500'
              : 'border-gray-200 hover:border-red-300 hover:text-red-400',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
        </Button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
            <Truck className="h-4 w-4 text-gray-600" />
          </div>
          <span>1-3 day delivery in Addis Ababa</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
            <ShieldCheck className="h-4 w-4 text-gray-600" />
          </div>
          <span>Authentic quality guaranteed</span>
        </div>
      </div>
    </div>
  );
}
