import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrders } from '@/actions/orders';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const result = await getOrders();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-[#0a0a0a]">My orders</h1>
      <p className="text-gray-600 mt-1 mb-6">Track your purchases and delivery status.</p>
      {result.data.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
          <Button asChild><Link href="/products">Start shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {result.data.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between gap-4">
              <div>
                <Link href={`/orders/${order.order_number}`} className="font-semibold hover:text-[#D4AF37]">Order {order.order_number}</Link>
                <p className="text-sm text-gray-600">{order.created_at.toLocaleDateString()} · {order.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(order.total_amount).toLocaleString()} {order.currency}</p>
                <p className="text-sm text-gray-600">{order.status.replaceAll('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}