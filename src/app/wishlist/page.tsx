import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getWishlist, removeFromWishlist } from '@/actions/wishlist';
import { getCurrentUser } from '@/lib/auth';
import { getCart } from '@/actions/cart';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, ArrowRight, Trash2, Loader2 } from 'lucide-react';

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/wishlist');
  }

  const [wishlistResult, cartResult] = await Promise.all([
    getWishlist(),
    getCart(),
  ]);

  const { items } = wishlistResult;
  const cart = cartResult.cart;

  async function handleRemove(productId: string) {
    'use server';
    await removeFromWishlist(productId);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist.</p>
            <Button asChild className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]">
              <Link href="/products">
                Discover Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product;
              const images = product.images || [];
              const firstImage = images[0]?.url;

              // Get min price from variants
              const minPrice = product.variants?.reduce<number>((min, v) => {
                const price = Number(v.price);
                if (Number.isFinite(price) && price < min) {
                  return price;
                }
                return min;
              }, Number.POSITIVE_INFINITY) ?? 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4"
                >
                  {/* Product image */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative h-32 w-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                  >
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-semibold text-[#0a0a0a] hover:text-[#D4AF37] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.category?.name}
                        </p>
                        <p className="text-lg font-bold text-[#0a0a0a] mt-2">
                          {minPrice.toLocaleString()} ETB
                        </p>
                      </div>
                      <form action={handleRemove.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </form>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                        asChild
                      >
                        <Link href={`/products/${product.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue shopping */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}