import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumber } from '@/actions/orders';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock3, PackageCheck, Truck } from 'lucide-react';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const result = await getOrderByNumber(orderNumber);
  if (!result.success || !result.order) notFound();
  const order = result.order;

  return (
    <Container className="py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
          <h1 className="text-3xl font-bold mt-4">Order confirmed</h1>
          <p className="text-gray-600 mt-2">Thank you for your order. Your order number is <strong>{order.order_number}</strong>.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button asChild><Link href="/account/orders">View order history</Link></Button>
            <Button asChild variant="outline"><Link href="/products">Continue shopping</Link></Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-5">Order tracking</h2>
          <div className="space-y-5">
            {order.status_history.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className="mt-0.5 text-[#D4AF37]"><Clock3 className="h-5 w-5" /></div>
                <div><p className="font-medium">{entry.to_status.replaceAll('_', ' ')}</p><p className="text-sm text-gray-500">{entry.created_at.toLocaleString()}{entry.note ? ` · ${entry.note}` : ''}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4"><PackageCheck className="h-5 w-5" /><h2 className="text-lg font-semibold">Items</h2></div>
          <div className="space-y-3">
            {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.product_name_snapshot} × {item.quantity}</span><span>{Number(item.subtotal).toLocaleString()} ETB</span></div>)}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold"><span>Total</span><span>{Number(order.total_amount).toLocaleString()} {order.currency}</span></div>
          <p className="flex items-center gap-2 text-sm text-gray-500 mt-4"><Truck className="h-4 w-4" /> Delivery status: {order.delivery_status.replaceAll('_', ' ')}</p>
        </div>
      </div>
    </Container>
  );
}