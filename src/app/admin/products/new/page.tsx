import Link from 'next/link';
import { getCategories } from '@/actions/admin/categories';
import { getBrands } from '@/actions/admin/brands';
import { requireAdmin } from '@/lib/auth';
import { NewProductForm } from '@/components/admin/new-product-form';

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, brands] = await Promise.all([
    getCategories({ includeInactive: true }),
    getBrands({ includeInactive: true }),
  ]);

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-gray-600">Back to products</Link>
        <h2 className="text-2xl font-bold mt-3">Add product</h2>
      </div>

      <NewProductForm categories={categories} brands={brands} />
    </div>
  );
}

