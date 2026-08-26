'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder, validateCoupon } from '@/actions/checkout';
import { Button } from '@/components/ui/button';

type Address = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  city: string;
  region: string;
  streetAddress: string;
  isDefault: boolean;
};

const methods = [
  { id: 'TELEBIRR', name: 'Telebirr' },
  { id: 'CHAPA', name: 'Chapa' },
  { id: 'CBE_BANK', name: 'CBE Bank' },
  { id: 'ABAY_BANK', name: 'Abay Bank' },
] as const;

export function CheckoutForm({ addresses, subtotal }: { addresses: Address[]; subtotal: number }) {
  const router = useRouter();
  const defaultAddress = addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? '';
  const [addressId, setAddressId] = useState(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState<(typeof methods)[number]['id']>('TELEBIRR');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function applyCoupon() {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.success && typeof result.discount === 'number') {
      setDiscount(result.discount);
      setCouponMessage(`Coupon applied: ${result.discount.toLocaleString()} ETB off`);
    } else {
      setDiscount(0);
      setCouponMessage(result.error ?? 'Coupon could not be applied');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!addressId) return setError('Add and select a delivery address before continuing.');
    setLoading(true);
    const result = await createOrder({ addressId, couponCode: couponCode || undefined, paymentMethod });
    if (result.success && 'orderNumber' in result) router.push(`/orders/${result.orderNumber}`);
    else setError(result.error ?? 'Unable to create order.');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Delivery address</h2>
          <Link href="/account/addresses" className="text-sm text-[#D4AF37] hover:text-[#0a0a0a]">Manage addresses</Link>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-600 mt-3">No saved addresses. <Link href="/account/addresses" className="underline">Add one before ordering.</Link></p>
        ) : (
          <div className="grid gap-3 mt-4">
            {addresses.map((address) => (
              <label key={address.id} className={`block rounded-lg border p-4 cursor-pointer ${addressId === address.id ? 'border-[#0a0a0a] ring-1 ring-[#0a0a0a]' : 'border-gray-200'}`}>
                <input type="radio" name="addressId" value={address.id} checked={addressId === address.id} onChange={() => setAddressId(address.id)} className="mr-3" />
                <span className="font-medium">{address.label || 'Delivery address'}</span>
                <span className="block text-sm text-gray-600 ml-6 mt-1">{address.recipientName} · {address.phone}<br />{address.streetAddress}, {address.city}, {address.region}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h2 className="font-semibold">Coupon</h2>
        <div className="flex gap-2 mt-3">
          <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm" />
          <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
        </div>
        {couponMessage && <p className="text-sm text-gray-600 mt-2">{couponMessage}</p>}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h2 className="font-semibold">Payment method</h2>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {methods.map((method) => (
            <label key={method.id} className={`rounded-lg border p-3 cursor-pointer text-sm ${paymentMethod === method.id ? 'border-[#0a0a0a] ring-1 ring-[#0a0a0a]' : 'border-gray-200'}`}>
              <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="mr-2" />
              {method.name}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
      <Button type="submit" disabled={loading || addresses.length === 0} className="w-full">{loading ? 'Creating order...' : `Place order${discount ? ` · ${(subtotal - discount).toLocaleString()} ETB+` : ''}`}</Button>
    </form>
  );
}