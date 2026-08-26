import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { updateProduct } from '@/actions/products';
import { getCategories } from '@/actions/admin/categories';
import { getBrands } from '@/actions/admin/brands';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/image-upload';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.products.findUnique({
      where: { id },
      include: { images: { where: { is_primary: true } } }
    }),
    getCategories({ includeInactive: true }),
    getBrands({ includeInactive: true }),
  ]);
  if (!product) notFound();

  const primaryImage = product.images?.[0]?.url || '';

  async function update(formData: FormData) {
    'use server';
    const result = await updateProduct({
      id,
      name: String(formData.get('name') || ''),
      slug: String(formData.get('slug') || ''),
      description: String(formData.get('description') || ''),
      short_description: String(formData.get('shortDescription') || ''),
      category_id: String(formData.get('categoryId') || ''),
      brand_id: String(formData.get('brandId') || '') || null,
      material: String(formData.get('material') || '') || null,
      gender: (String(formData.get('gender') || '') || null) as 'MALE' | 'FEMALE' | 'UNISEX' | null,
      status: String(formData.get('status') || 'DRAFT') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
      featured: formData.get('featured') === 'on',
      imageUrl: String(formData.get('imageUrl') || '') || null,
    });
    if (result.success) redirect('/admin/products');
    throw new Error(result.error || 'Failed to update product');
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-gray-600">Back to products</Link>
        <h2 className="text-2xl font-bold mt-3">Edit product</h2>
      </div>
      <form action={update} className="bg-white rounded-xl border p-6 space-y-4">
        <input name="name" defaultValue={product.name} className="w-full h-10 border rounded-md px-3" required />
        <input name="slug" defaultValue={product.slug} className="w-full h-10 border rounded-md px-3" required />
        <textarea name="description" defaultValue={product.description} className="w-full min-h-28 border rounded-md px-3 py-2" required />
        <input name="shortDescription" defaultValue={product.short_description || ''} className="w-full h-10 border rounded-md px-3" />
        
        {/* Supabase direct file upload component with default value */}
        <ImageUpload name="imageUrl" defaultValue={primaryImage} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select name="categoryId" defaultValue={product.category_id} className="h-10 border rounded-md px-3" required>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select name="brandId" defaultValue={product.brand_id || ''} className="h-10 border rounded-md px-3">
            <option value="">No brand</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <select name="gender" defaultValue={product.gender || ''} className="h-10 border rounded-md px-3">
            <option value="">Gender</option>
            <option value="MALE">Men</option>
            <option value="FEMALE">Women</option>
            <option value="UNISEX">Unisex</option>
          </select>
          <select name="status" defaultValue={product.status} className="h-10 border rounded-md px-3">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <input name="material" defaultValue={product.material || ''} className="w-full h-10 border rounded-md px-3" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured product
        </label>
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
