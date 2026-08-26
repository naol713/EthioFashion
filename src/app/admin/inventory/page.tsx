import { getInventory, adjustAdminInventory } from '@/actions/admin/inventory';

export default async function AdminInventoryPage() {
  const inventory = await getInventory();
  async function adjust(formData: FormData) {
    'use server';
    await adjustAdminInventory(String(formData.get('variantId')), Number(formData.get('quantity')), String(formData.get('note') || ''));
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Inventory</h2><p className="text-gray-600 mt-1">Monitor available stock and record adjustments.</p></div><div className="bg-white rounded-xl border border-gray-200 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Variant</th><th className="p-4">SKU</th><th className="p-4">Total</th><th className="p-4">Reserved</th><th className="p-4">Available</th><th className="p-4">Adjust</th></tr></thead><tbody className="divide-y">{inventory.map((item) => <tr key={item.id}><td className="p-4">{item.variant.product.name} {item.variant.size?.name || ''}</td><td className="p-4">{item.variant.sku}</td><td className="p-4">{item.quantity}</td><td className="p-4">{item.reserved_quantity}</td><td className="p-4 font-semibold">{item.quantity - item.reserved_quantity}</td><td className="p-4"><form action={adjust} className="flex gap-2"><input type="hidden" name="variantId" value={item.variant_id} /><input name="quantity" type="number" className="w-20 h-9 border rounded-md px-2" placeholder="+/-" required /><input name="note" className="w-32 h-9 border rounded-md px-2" placeholder="Note" /><button className="h-9 px-3 rounded-md bg-[#0a0a0a] text-white" type="submit">Save</button></form></td></tr>)}</tbody></table></div></div>;
}