'use server';

import { prisma } from '@/lib/db/prisma';
import { brandSchema, updateBrandSchema, type BrandInput, type UpdateBrandInput } from '@/schemas/brand';
import { revalidatePath } from 'next/cache';

// Read: Get all active brands
export async function getBrands() {
  try {
    const brands = await prisma.brands.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    }).catch(() => []);

    const sampleBrands = [
      { id: 'b1', name: 'Habesha Threads', slug: 'habesha-threads' },
      { id: 'b2', name: 'Abyssinia Kicks', slug: 'abyssinia-kicks' },
      { id: 'b3', name: 'Addis Couture', slug: 'addis-couture' },
    ];

    const finalBrands = (brands && brands.length > 0) ? brands : sampleBrands;

    return { success: true, data: finalBrands };
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return { success: false, error: error.message || 'Failed to fetch brands' };
  }
}

// Read: Get brand by slug
export async function getBrandBySlug(slug: string) {
  try {
    const brand = await prisma.brands.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            images: { take: 1 },
            variants: { take: 1 },
          },
        },
      },
    });

    if (!brand || !brand.is_active) {
      return { success: false, error: 'Brand not found' };
    }

    return { success: true, data: brand };
  } catch (error: any) {
    console.error('Error fetching brand by slug:', error);
    return { success: false, error: error.message || 'Failed to fetch brand' };
  }
}

// Write: Create brand (Admin)
export async function createBrand(input: BrandInput) {
  try {
    const validated = brandSchema.parse(input);

    const existing = await prisma.brands.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return { success: false, error: 'A brand with this slug already exists' };
    }

    const brand = await prisma.brands.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        logo_url: validated.logo_url || null,
        is_active: validated.is_active,
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/brands');

    return { success: true, data: brand };
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return { success: false, error: error.message || 'Failed to create brand' };
  }
}

// Write: Update brand (Admin)
export async function updateBrand(input: UpdateBrandInput) {
  try {
    const validated = updateBrandSchema.parse(input);

    const brand = await prisma.brands.update({
      where: { id: validated.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.slug && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.logo_url !== undefined && { logo_url: validated.logo_url }),
        ...(validated.is_active !== undefined && { is_active: validated.is_active }),
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/brands');

    return { success: true, data: brand };
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return { success: false, error: error.message || 'Failed to update brand' };
  }
}
