import Link from 'next/link';
import { getAdminProducts } from '@/actions/products';
import { archiveProduct } from '@/actions/products';
import { Button } from '@/components/ui/button';

export default async function AdminProductsPage() {
  const result = await getAdminProducts(100);
  async function archive(formData: FormData) {
    'use server';
    await archiveProduct(String(formData.get('id')));
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">Products</h2><p className="text-gray-600 mt-1">Catalog management and product status.</p></div><Button asChild><Link href="/admin/products/new">Add product</Link></Button></div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Variants</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y">{result.data.map((product) => <tr key={product.id}><td className="p-4"><Link href={`/products/${product.slug}`} className="font-medium hover:text-[#D4AF37]">{product.name}</Link><p className="text-xs text-gray-500">{product.slug}</p></td><td className="p-4">{product.category?.name}</td><td className="p-4">{'status' in product ? String(product.status) : 'ACTIVE'}</td><td className="p-4">{product.variants?.length ?? 0}</td><td className="p-4"><div className="flex gap-3"><Link href={`/admin/products/${product.id}`} className="text-[#D4AF37]">Edit</Link>{'status' in product && product.status !== 'ARCHIVED' && <form action={archive}><input type="hidden" name="id" value={product.id} /><button type="submit" className="text-red-600">Archive</button></form>}</div></td></tr>)}</tbody></table></div>
    </div>
  );
}
