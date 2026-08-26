'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';

const imageSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  variant_id: z.string().uuid('Invalid variant ID').optional().nullable(),
  url: z.string().url('Must be a valid URL'),
  alt_text: z.string().optional().nullable(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export type AddImageInput = z.infer<typeof imageSchema>;

// Add image to product or variant (Admin Only)
export async function addProductImage(input: AddImageInput) {
  try {
    await requireAdmin(); // Ensure only admins can upload
    const validated = imageSchema.parse(input);

    // If marked as primary, unmark existing primary image for this product
    if (validated.is_primary) {
      await prisma.product_images.updateMany({
        where: { product_id: validated.product_id, is_primary: true },
        data: { is_primary: false },
      });
    }

    const image = await prisma.product_images.create({
      data: {
        product_id: validated.product_id,
        variant_id: validated.variant_id || null,
        url: validated.url,
        alt_text: validated.alt_text || null,
        is_primary: validated.is_primary,
        sort_order: validated.sort_order,
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, data: image };
  } catch (error: any) {
    console.error('Error adding product image:', error);
    return { success: false, error: error.message || 'Failed to add image' };
  }
}

// Delete product image (Admin Only)
export async function deleteProductImage(imageId: string) {
  try {
    await requireAdmin(); // Ensure only admins can delete
    const deleted = await prisma.product_images.delete({
      where: { id: imageId },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error('Error deleting product image:', error);
    return { success: false, error: error.message || 'Failed to delete image' };
  }
}

// Update product image (Admin Only)
export async function updateProductImage(
  imageId: string,
  data: {
    alt_text?: string | null;
    is_primary?: boolean;
    sort_order?: number;
  }
) {
  try {
    await requireAdmin(); // Ensure only admins can update
    const updated = await prisma.product_images.update({
      where: { id: imageId },
      data,
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating product image:', error);
    return { success: false, error: error.message || 'Failed to update image' };
  }
}

// Reorder product images (Admin Only)
export async function reorderProductImages(
  productId: string,
  imageOrders: { id: string; sort_order: number }[]
) {
  try {
    await requireAdmin(); // Ensure only admins can reorder
    await prisma.$transaction(
      imageOrders.map((order) =>
        prisma.product_images.update({
          where: { id: order.id, product_id: productId },
          data: { sort_order: order.sort_order },
        })
      )
    );

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error reordering product images:', error);
    return { success: false, error: error.message || 'Failed to reorder images' };
  }
}