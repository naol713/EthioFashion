import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumberAdmin } from '@/actions/orders';
import { ArrowLeft, Clock3, PackageCheck, Truck, User, CreditCard, MapPin } from 'lucide-react';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const result = await getOrderByNumberAdmin(orderNumber);
  if (!result.success || !result.order) notFound();
  const order = result.order;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-[#0a0a0a] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold">{order.order_number}</h2>
        <p className="text-gray-500 text-sm mt-1">
          Placed on {order.created_at.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">Customer</h3>
          </div>
          <div className="text-sm space-y-1 text-gray-700">
            <p className="font-medium">{order.user.first_name} {order.user.last_name}</p>
            <p className="text-gray-500">{order.user.email}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">Payment</h3>
          </div>
          <div className="text-sm space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium">{order.payment_status.replaceAll('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order status</span>
              <span className="font-medium">{order.status.replaceAll('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="font-medium">{order.delivery_status.replaceAll('_', ' ')}</span>
            </div>
            {order.payment?.payment_method && (
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.payment.payment_method.replaceAll('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {(order.address || order.shipping_address_snapshot) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">Delivery address</h3>
          </div>
          {order.address ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{order.address.recipient_name}</p>
              <p className="text-gray-500">{order.address.phone}</p>
              <p>{order.address.street_address}{order.address.building ? `, ${order.address.building}` : ''}</p>
              <p>
                {[order.address.woreda, order.address.sub_city, order.address.city, order.address.region]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {order.address.additional_info && (
                <p className="text-gray-500 italic">{order.address.additional_info}</p>
              )}
              {order.address.label && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 rounded-full">{order.address.label}</span>
              )}
            </div>
          ) : (
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(order.shipping_address_snapshot, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Customer note */}
      {order.customer_note && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-2">Customer note</h3>
          <p className="text-sm text-gray-600 italic">"{order.customer_note}"</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <PackageCheck className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold">Items ordered</h3>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start gap-4 text-sm">
              <div>
                <p className="font-medium">{item.product_name_snapshot}</p>
                {item.variant_snapshot && (
                  <p className="text-gray-500 text-xs mt-0.5">{String(item.variant_snapshot)}</p>
                )}
                <p className="text-gray-500 text-xs">Qty: {item.quantity} × {Number(item.unit_price).toLocaleString()} {order.currency}</p>
              </div>
              <span className="font-medium whitespace-nowrap">{Number(item.subtotal).toLocaleString()} {order.currency}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-2 pt-4 flex justify-between font-bold text-sm">
          <span>Total</span>
          <span>{Number(order.total_amount).toLocaleString()} {order.currency}</span>
        </div>
      </div>

      {/* Status History */}
      {order.status_history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold">Status history</h3>
          </div>
          <div className="space-y-4">
            {order.status_history.map((entry) => (
              <div key={entry.id} className="flex gap-3 text-sm">
                <div className="mt-0.5 text-[#D4AF37]"><Clock3 className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium">{entry.to_status.replaceAll('_', ' ')}</p>
                  <p className="text-xs text-gray-500">
                    {entry.created_at.toLocaleString()}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
