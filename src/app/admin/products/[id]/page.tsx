import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getCategories } from '@/actions/admin/categories';
import { getBrands } from '@/actions/admin/brands';
import { EditProductForm } from '@/components/admin/edit-product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.products.findUnique({
      where: { id },
      include: {
        images: { where: { is_primary: true } },
        variants: {
          include: {
            size: true,
            inventory: true,
          },
        },
      },
    }),
    getCategories({ includeInactive: true }),
    getBrands({ includeInactive: true }),
  ]);
  if (!product) notFound();

  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      cost_price: v.cost_price ? Number(v.cost_price) : null,
      weight: v.weight ? Number(v.weight) : null,
    })),
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-gray-600">Back to products</Link>
        <h2 className="text-2xl font-bold mt-3">Edit product</h2>
      </div>
      <EditProductForm product={serializedProduct} categories={categories} brands={brands} />
    </div>
  );
}

