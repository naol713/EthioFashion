import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createProduct } from '@/actions/products';
import { getCategories } from '@/actions/admin/categories';
import { getBrands } from '@/actions/admin/brands';
import { requireAdmin } from '@/lib/auth';
import { ImageUpload } from '@/components/admin/image-upload';
import { ProductSizeFields } from '@/components/admin/product-size-fields';
import { Button } from '@/components/ui/button';

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, brands] = await Promise.all([
    getCategories({ includeInactive: true }),
    getBrands({ includeInactive: true }),
  ]);

  async function create(formData: FormData) {
    'use server';

    const result = await createProduct({
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
      price: Number(formData.get('price') || 0),
      compare_at_price: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : null,
      stock_quantity: Number(formData.get('stockQuantity') || 0),
      size_type: (String(formData.get('sizeType') || 'CLOTHING') || null) as 'CLOTHING' | 'SHOE' | null,
      sizes:
        String(formData.get('sizeType') || 'CLOTHING') === 'SHOE'
          ? String(formData.get('shoeSizes') || '')
              .split(/[\n,]/)
              .map((size) => size.trim())
              .flatMap((size) => {
                const range = size.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
                if (!range) return [size];
                const start = Number(range[1]);
                const end = Number(range[2]);
                const step = Number.isInteger(start) && Number.isInteger(end) ? 1 : 0.5;
                const values: string[] = [];
                const min = Math.min(start, end);
                const max = Math.max(start, end);
                for (let value = min; value <= max + 1e-9; value += step) {
                  values.push(Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, ''));
                }
                return values;
              })
              .filter(Boolean)
          : formData.getAll('sizes').map((size) => String(size).trim()).filter(Boolean),
    });

    if (result.success) redirect('/admin/products');
    throw new Error(result.error || 'Failed to create product');
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-gray-600">Back to products</Link>
        <h2 className="text-2xl font-bold mt-3">Add product</h2>
      </div>

      <form action={create} className="bg-white rounded-xl border p-6 space-y-4">
        <input name="name" placeholder="Product name" className="w-full h-10 border rounded-md px-3" required />
        <input name="slug" placeholder="product-slug" className="w-full h-10 border rounded-md px-3" required />
        <textarea name="description" placeholder="Description" className="w-full min-h-28 border rounded-md px-3 py-2" required />
        <input name="shortDescription" placeholder="Short description" className="w-full h-10 border rounded-md px-3" />

        <ImageUpload name="imageUrl" />

        <fieldset className="rounded-lg border border-gray-200 p-5">
          <legend className="px-1 text-sm font-semibold text-gray-800">Pricing & Inventory</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-gray-600">
              <span>Price (ETB) *</span>
              <input name="price" type="number" min="0.01" step="0.01" placeholder="e.g. 4500" className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900" required />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-600">
              <span>Compare at Price (ETB)</span>
              <input name="compareAtPrice" type="number" min="0.01" step="0.01" placeholder="e.g. 5200 (optional)" className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900" />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-600">
              <span>Stock Quantity per size *</span>
              <input name="stockQuantity" type="number" min="0" step="1" placeholder="e.g. 10" className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900" required />
            </label>
          </div>
        </fieldset>

        <ProductSizeFields />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select name="categoryId" defaultValue="" className="h-10 border rounded-md px-3" required>
            <option value="" disabled>Category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select name="brandId" defaultValue="" className="h-10 border rounded-md px-3">
            <option value="">No brand</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <select name="gender" defaultValue="" className="h-10 border rounded-md px-3">
            <option value="">Gender</option>
            <option value="MALE">Men</option>
            <option value="FEMALE">Women</option>
            <option value="UNISEX">Unisex</option>
          </select>
          <select name="status" defaultValue="DRAFT" className="h-10 border rounded-md px-3">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <input name="material" placeholder="Material" className="w-full h-10 border rounded-md px-3" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Featured product
        </label>
        <Button type="submit">Create product</Button>
      </form>
    </div>
  );
}
