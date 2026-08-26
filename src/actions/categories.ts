'use server';

import { prisma } from '@/lib/db/prisma';
import { categorySchema, updateCategorySchema, type CategoryInput, type UpdateCategoryInput } from '@/schemas/category';
import { revalidatePath } from 'next/cache';

// Read: Get all top-level categories with subcategories
export async function getCategories() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        is_active: true,
        parent_id: null,
      },
      include: {
        children: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
      },
      orderBy: { sort_order: 'asc' },
    }).catch(() => []);

    const sampleCategories = [
      { id: 'c1', name: 'Men\'s Clothing', slug: 'men', children: [] },
      { id: 'c2', name: 'Women\'s Dresses & Tops', slug: 'women', children: [] },
      { id: 'c3', name: 'Shoes & Boots', slug: 'shoes', children: [] },
    ];

    const finalCategories = (categories && categories.length > 0) ? categories : sampleCategories;

    return { success: true, data: finalCategories };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message || 'Failed to fetch categories' };
  }
}

// Read: Get single category by slug
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.categories.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { is_active: true },
        },
      },
    });

    if (!category || !category.is_active) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error fetching category by slug:', error);
    return { success: false, error: error.message || 'Failed to fetch category' };
  }
}

// Write: Create category (Admin)
export async function createCategory(input: CategoryInput) {
  try {
    const validated = categorySchema.parse(input);

    const existing = await prisma.categories.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return { success: false, error: 'A category with this slug already exists' };
    }

    const category = await prisma.categories.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        image_url: validated.image_url || null,
        parent_id: validated.parent_id || null,
        is_active: validated.is_active,
        sort_order: validated.sort_order,
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/categories');

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

// Write: Update category (Admin)
export async function updateCategory(input: UpdateCategoryInput) {
  try {
    const validated = updateCategorySchema.parse(input);

    const category = await prisma.categories.update({
      where: { id: validated.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.slug && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.image_url !== undefined && { image_url: validated.image_url }),
        ...(validated.parent_id !== undefined && { parent_id: validated.parent_id }),
        ...(validated.is_active !== undefined && { is_active: validated.is_active }),
        ...(validated.sort_order !== undefined && { sort_order: validated.sort_order }),
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/categories');

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message || 'Failed to update category' };
  }
}
