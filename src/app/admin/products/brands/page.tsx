import { getBrands, createBrand } from '@/actions/admin/brands';
import { Button } from '@/components/ui/button';

export default async function AdminBrandsPage() {
  const brands = await getBrands({ includeInactive: true });
  async function create(formData: FormData) {
    'use server';
    await createBrand({ name: String(formData.get('name') || ''), slug: String(formData.get('slug') || ''), description: String(formData.get('description') || ''), logo_url: String(formData.get('logoUrl') || ''), is_active: true });
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Brands</h2><p className="text-gray-600 mt-1">Manage product brands.</p></div><form action={create} className="bg-white rounded-xl border p-5 flex flex-wrap gap-3"><input name="name" placeholder="Brand name" className="h-10 border rounded-md px-3" required /><input name="slug" placeholder="brand-slug" className="h-10 border rounded-md px-3" required /><input name="description" placeholder="Description" className="h-10 border rounded-md px-3 flex-1" /><Button type="submit">Create</Button></form><div className="bg-white rounded-xl border divide-y">{brands.map((brand) => <div key={brand.id} className="p-4 flex justify-between gap-4 text-sm"><span className="font-medium">{brand.name}<span className="text-gray-500 ml-2">/{brand.slug}</span></span><span className="text-gray-600">{brand._count.products} products · {brand.is_active ? 'Active' : 'Inactive'}</span></div>)}</div></div>;
}