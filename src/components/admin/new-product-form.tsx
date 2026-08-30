'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/actions/products';
import { ImageUpload } from '@/components/admin/image-upload';
import { ProductSizeFields } from '@/components/admin/product-size-fields';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface NewProductFormProps {
  categories: Category[];
  brands: Brand[];
}

export function NewProductForm({ categories, brands }: NewProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format values to match slug rules (lowercase letters, numbers, and hyphens)
  const sanitizeSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove anything that is not alphanumeric or hyphen
      .replace(/-+/g, '-'); // Remove duplicate hyphens
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugTouched) {
      setSlug(sanitizeSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugTouched(true);
    setSlug(sanitizeSlug(e.target.value));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Determine sizes based on product-size-fields conventions
      const sizeTypeInput = formData.get('sizeType') || 'CLOTHING';
      let sizes: string[] = [];

      if (sizeTypeInput === 'SHOE') {
        const shoeSizesValue = String(formData.get('shoeSizes') || '');
        sizes = shoeSizesValue
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
          .filter(Boolean);
      } else {
        sizes = formData.getAll('sizes').map((size) => String(size).trim()).filter(Boolean);
      }

      const result = await createProduct({
        name,
        slug,
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
        sizes,
      });

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        if (result.error) {
          try {
            const parsed = JSON.parse(result.error);
            if (Array.isArray(parsed)) {
              // Standard format for validation array
              const messages = parsed.map((err: any) => err.message || JSON.stringify(err)).join('. ');
              setError(messages);
            } else {
              setError(result.error);
            }
          } catch {
            setError(result.error);
          }
        } else {
          setError('Failed to create product');
        }
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
        <input
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Product name"
          className="w-full h-10 border rounded-md px-3 text-gray-900"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Slug *</label>
        <input
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          placeholder="product-slug"
          className="w-full h-10 border rounded-md px-3 text-gray-900"
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Only lowercase letters, numbers, and hyphens are allowed. Autogenerated from name.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
        <textarea
          name="description"
          placeholder="Description"
          className="w-full min-h-28 border rounded-md px-3 py-2 text-gray-900"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
        <input
          name="shortDescription"
          placeholder="Short description"
          className="w-full h-10 border rounded-md px-3 text-gray-900"
          disabled={isSubmitting}
        />
      </div>

      <ImageUpload name="imageUrl" />

      <fieldset className="rounded-lg border border-gray-200 p-5" disabled={isSubmitting}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Pricing & Inventory</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-gray-600">
            <span>Price (ETB) *</span>
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 4500"
              className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-600">
            <span>Compare at Price (ETB)</span>
            <input
              name="compareAtPrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 5200 (optional)"
              className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-600">
            <span>Stock Quantity per size *</span>
            <input
              name="stockQuantity"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 10"
              className="w-full h-12 border rounded-md px-3 text-base font-normal text-gray-900"
              required
            />
          </label>
        </div>
      </fieldset>

      <ProductSizeFields />

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-0 p-0 m-0" disabled={isSubmitting}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
          <select name="categoryId" defaultValue="" className="w-full h-10 border rounded-md px-3" required>
            <option value="" disabled>Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
          <select name="brandId" defaultValue="" className="w-full h-10 border rounded-md px-3">
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
          <select name="gender" defaultValue="" className="w-full h-10 border rounded-md px-3">
            <option value="">Gender</option>
            <option value="MALE">Men</option>
            <option value="FEMALE">Women</option>
            <option value="UNISEX">Unisex</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue="DRAFT" className="w-full h-10 border rounded-md px-3">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Material</label>
        <input
          name="material"
          placeholder="Material"
          className="w-full h-10 border rounded-md px-3 text-gray-900"
          disabled={isSubmitting}
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          name="featured"
          disabled={isSubmitting}
          className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
        />
        <span>Featured product</span>
      </label>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[140px]">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create product'
        )}
      </Button>
    </form>
  );
}
