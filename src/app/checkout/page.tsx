import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCart } from '@/actions/cart';
import { getAddresses } from '@/actions/addresses';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from 'lucide-react';

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/checkout');

  const result = await getCart();
  if (!result.success || !result.cart) {
    return (
      <Container className="py-16 text-center">
        <ShoppingBag className="h-14 w-14 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold">Unable to load checkout</h1>
        <p className="text-gray-600 mt-2 mb-6">{result.error}</p>
        <Button asChild><Link href="/cart">Return to cart</Link></Button>
      </Container>
    );
  }

  const { cart } = result;
  if (cart.items.length === 0) redirect('/cart');
  const addressResult = await getAddresses();

  const shipping = cart.subtotal > 1000 ? 0 : 50;
  const total = cart.subtotal + shipping;

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a0a0a]">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <h1 className="text-3xl font-bold text-[#0a0a0a] mt-5">Checkout</h1>
        <div className="flex items-center gap-3 mt-4 text-sm">
          <span className="font-semibold text-[#0a0a0a]">1. Review cart</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">2. Delivery</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">3. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your items ({cart.itemCount})</h2>
            <div className="divide-y divide-gray-100">
              {cart.items.map((item) => {
                const product = item.variant.product;
                const image = product.images?.[0]?.url;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {image ? <Image src={image} alt={product.name} fill className="object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-gray-400">No image</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${product.slug}`} className="font-medium hover:text-[#D4AF37]">{product.name}</Link>
                      <p className="text-sm text-gray-500 mt-1">Qty {item.quantity} · {Number(item.variant.price).toLocaleString()} ETB each</p>
                    </div>
                    <p className="font-semibold">{(Number(item.variant.price) * item.quantity).toLocaleString()} ETB</p>
                  </div>
                );
              })}
            </div>
          </div>

          <CheckoutForm
            addresses={addressResult.addresses.map((address) => ({
              id: address.id,
              label: address.label,
              recipientName: address.recipient_name,
              phone: address.phone,
              city: address.city,
              region: address.region,
              streetAddress: address.street_address,
              isDefault: address.is_default,
            }))}
            subtotal={cart.subtotal}
          />
        </section>

        <aside className="bg-white rounded-xl border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold mb-4">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{cart.subtotal.toLocaleString()} ETB</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{shipping === 0 ? 'FREE' : `${shipping.toLocaleString()} ETB`}</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold"><span>Total</span><span>{total.toLocaleString()} ETB</span></div>
          </div>
          <div className="mt-6 pt-5 border-t border-gray-200 flex gap-2 text-xs text-gray-500">
            <Lock className="h-4 w-4 shrink-0 text-green-600" /> Secure checkout
          </div>
          <Button asChild variant="outline" className="w-full mt-5"><Link href="/cart">Edit cart <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </aside>
      </div>
    </Container>
  );
}