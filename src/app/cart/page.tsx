import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getCart, removeFromCart, updateCartItem, clearCart } from '@/actions/cart';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/cart');
  }

  const result = await getCart();

  if (!result.success || !result.cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Error loading cart</h1>
            <p className="text-gray-600 mb-6">{result.error}</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const { cart } = result;
  const shipping = cart.subtotal > 1000 ? 0 : 50; // Free shipping over 1000 ETB

  async function handleRemove(itemId: string) {
    'use server';
    await removeFromCart(itemId);
  }

  async function handleUpdate(itemId: string, quantity: number) {
    'use server';
    await updateCartItem(itemId, quantity);
  }

  async function handleClear() {
    'use server';
    await clearCart();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Button asChild className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.variant.product;
                const price = item.variant.price;
                const image = product.images?.[0]?.url;
                const colorName = item.variant.color?.name ?? 'Default';
                const sizeName = item.variant.size?.name ?? 'One size';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4"
                  >
                    {/* Product image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                    >
                      {image ? (
                        <Image
                          src={image}
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
                            {colorName} / {sizeName}
                          </p>
                          <p className="text-sm font-medium text-[#0a0a0a] mt-1">
                            {price.toLocaleString()} ETB
                          </p>
                        </div>
                        <form action={handleRemove.bind(null, item.id)}>
                          <button
                            type="submit"
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </form>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <form action={handleUpdate.bind(null, item.id, item.quantity - 1)}>
                            <button
                              type="submit"
                              disabled={item.quantity <= 1}
                              className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </form>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <form action={handleUpdate.bind(null, item.id, item.quantity + 1)}>
                            <button
                              type="submit"
                              disabled={item.quantity >= 10}
                              className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                        <p className="font-semibold text-[#0a0a0a]">
                          {(price * item.quantity).toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
              <div className="flex justify-end">
                <form action={handleClear}>
                  <button
                    type="submit"
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Clear cart
                  </button>
                </form>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                    <span className="font-medium">{cart.subtotal.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `${shipping.toLocaleString()} ETB`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over 1,000 ETB
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-[#0a0a0a]">Total</span>
                    <span className="font-bold text-lg text-[#0a0a0a]">
                      {(cart.subtotal + shipping).toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    asChild
                    className="w-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-green-600">🔒</span>
                    <span>Secure checkout with Telebirr, Chapa, CBE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}