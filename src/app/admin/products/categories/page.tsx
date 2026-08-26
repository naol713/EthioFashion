import { getCategories, createCategory } from '@/actions/admin/categories';
import { Button } from '@/components/ui/button';

export default async function AdminCategoriesPage() {
  const categories = await getCategories({ includeInactive: true });
  async function create(formData: FormData) {
    'use server';
    await createCategory({ name: String(formData.get('name') || ''), slug: String(formData.get('slug') || ''), description: String(formData.get('description') || ''), image_url: String(formData.get('imageUrl') || ''), parent_id: null, is_active: true, sort_order: 0 });
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Categories</h2><p className="text-gray-600 mt-1">Organize the product catalog.</p></div><form action={create} className="bg-white rounded-xl border p-5 flex flex-wrap gap-3"><input name="name" placeholder="Category name" className="h-10 border rounded-md px-3" required /><input name="slug" placeholder="category-slug" className="h-10 border rounded-md px-3" required /><input name="description" placeholder="Description" className="h-10 border rounded-md px-3 flex-1" /><Button type="submit">Create</Button></form><div className="bg-white rounded-xl border divide-y">{categories.map((category) => <div key={category.id} className="p-4 flex justify-between gap-4 text-sm"><span className="font-medium">{category.name}<span className="text-gray-500 ml-2">/{category.slug}</span></span><span className="text-gray-600">{category._count.products} products · {category.is_active ? 'Active' : 'Inactive'}</span></div>)}</div></div>;
}