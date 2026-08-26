import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { updateOrderStatus } from '@/actions/orders';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.orders.findMany({ include: { user: true, items: true }, orderBy: { created_at: 'desc' }, take: 100 });
  async function update(formData: FormData) {
    'use server';
    await updateOrderStatus(String(formData.get('id')), String(formData.get('status')) as never);
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Orders</h2><p className="text-gray-600 mt-1">Review orders and advance their lifecycle.</p></div><div className="bg-white rounded-xl border border-gray-200 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Update</th></tr></thead><tbody className="divide-y">{orders.map((order) => <tr key={order.id}><td className="p-4"><Link href={`/orders/${order.order_number}`} className="font-medium hover:text-[#D4AF37]">{order.order_number}</Link><p className="text-xs text-gray-500">{order.created_at.toLocaleDateString()}</p></td><td className="p-4">{order.user.first_name} {order.user.last_name}</td><td className="p-4">{Number(order.total_amount).toLocaleString()} ETB</td><td className="p-4">{order.status.replaceAll('_', ' ')}</td><td className="p-4"><form action={update} className="flex gap-2"><input type="hidden" name="id" value={order.id} /><select name="status" className="h-9 border rounded-md px-2"><option value="PAID">Paid</option><option value="CONFIRMED">Confirmed</option><option value="PROCESSING">Processing</option><option value="READY_FOR_DELIVERY">Ready</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select><button className="h-9 px-3 rounded-md bg-[#0a0a0a] text-white" type="submit">Update</button></form></td></tr>)}</tbody></table></div></div>;
}