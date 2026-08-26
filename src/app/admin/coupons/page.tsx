import { getCoupons, createCoupon, toggleCoupon } from '@/actions/admin/coupons';
import { Button } from '@/components/ui/button';

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  async function create(formData: FormData) {
    'use server';
    await createCoupon({ code: formData.get('code'), discountType: formData.get('discountType'), discountValue: formData.get('discountValue'), minimumOrderAmount: formData.get('minimumOrderAmount') || undefined, maximumDiscount: formData.get('maximumDiscount') || undefined, usageLimit: formData.get('usageLimit') || undefined });
  }
  async function toggle(formData: FormData) {
    'use server';
    await toggleCoupon(String(formData.get('id')), formData.get('active') !== 'true');
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Coupons</h2><p className="text-gray-600 mt-1">Create and control promotional codes.</p></div><form action={create} className="bg-white rounded-xl border p-5 grid grid-cols-2 lg:grid-cols-6 gap-3"><input name="code" placeholder="Code" className="h-10 border rounded-md px-3" required /><select name="discountType" className="h-10 border rounded-md px-3"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed ETB</option></select><input name="discountValue" type="number" step="0.01" placeholder="Value" className="h-10 border rounded-md px-3" required /><input name="minimumOrderAmount" type="number" placeholder="Min order" className="h-10 border rounded-md px-3" /><input name="maximumDiscount" type="number" placeholder="Max discount" className="h-10 border rounded-md px-3" /><Button type="submit">Create</Button></form><div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Usage</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y">{coupons.map((coupon) => <tr key={coupon.id}><td className="p-4 font-medium">{coupon.code}</td><td className="p-4">{Number(coupon.discount_value)} {coupon.discount_type === 'PERCENTAGE' ? '%' : 'ETB'}</td><td className="p-4">{coupon.usage_count}/{coupon.usage_limit ?? '∞'}</td><td className="p-4">{coupon.is_active ? 'Active' : 'Inactive'}</td><td className="p-4"><form action={toggle}><input type="hidden" name="id" value={coupon.id} /><input type="hidden" name="active" value={String(coupon.is_active)} /><button className="text-[#D4AF37]" type="submit">{coupon.is_active ? 'Deactivate' : 'Activate'}</button></form></td></tr>)}</tbody></table></div></div>;
}