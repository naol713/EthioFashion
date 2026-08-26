'use server';

import { prisma } from '@/lib/db/prisma';
import { variantSchema, updateVariantSchema, type VariantInput, type UpdateVariantInput } from '@/schemas/variant';
import { InventoryTransactionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

// Read: Get variants for a specific product
export async function getVariantsByProduct(productId: string) {
  try {
    const variants = await prisma.product_variants.findMany({
      where: { product_id: productId, is_active: true },
      include: {
        color: true,
        size: true,
        inventory: true,
      },
      orderBy: { price: 'asc' },
    });

    return { success: true, data: variants };
  } catch (error: unknown) {
    console.error('Error fetching variants:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch variants' };
  }
}

// Write: Create variant with inventory initialization (Admin)
export async function createVariant(input: VariantInput) {
  try {
    await requireAdmin();
    const validated = variantSchema.parse(input);

    const existingSku = await prisma.product_variants.findUnique({
      where: { sku: validated.sku },
    });

    if (existingSku) {
      return { success: false, error: 'A variant with this SKU already exists' };
    }

    // Atomic transaction for variant + inventory + initial audit log
    const variant = await prisma.$transaction(async (tx) => {
      const createdVariant = await tx.product_variants.create({
        data: {
          product_id: validated.product_id,
          sku: validated.sku,
          color_id: validated.color_id || null,
          size_id: validated.size_id || null,
          price: validated.price,
          compare_at_price: validated.compare_at_price || null,
          cost_price: validated.cost_price || null,
          low_stock_threshold: validated.low_stock_threshold,
          is_active: validated.is_active,
        },
      });

      // Create initial inventory record
      const createdInventory = await tx.inventory.create({
        data: {
          variant_id: createdVariant.id,
          quantity: validated.initial_quantity,
          reserved_quantity: 0,
          low_stock_threshold: validated.low_stock_threshold,
        },
      });

      // Log initial stock transaction if quantity > 0
      if (validated.initial_quantity > 0) {
        try {
          await tx.inventory_transactions.create({
            data: {
              variant_id: createdInventory.id,
              type: InventoryTransactionType.INITIAL_STOCK,
              quantity: validated.initial_quantity,
              previous_quantity: 0,
              new_quantity: validated.initial_quantity,
              note: 'Initial variant creation stock',
            },
          });
        } catch (inventoryError) {
          console.warn('Initial stock audit log could not be written:', inventoryError);
        }
      }

      return createdVariant;
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, data: variant };
  } catch (error: unknown) {
    console.error('Error creating variant:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create variant' };
  }
}

// Write: Update variant (Admin)
export async function updateVariant(input: UpdateVariantInput) {
  try {
    await requireAdmin();
    const validated = updateVariantSchema.parse(input);

    const updated = await prisma.product_variants.update({
      where: { id: validated.id },
      data: {
        ...(validated.sku && { sku: validated.sku }),
        ...(validated.price && { price: validated.price }),
        ...(validated.compare_at_price !== undefined && { compare_at_price: validated.compare_at_price }),
        ...(validated.cost_price !== undefined && { cost_price: validated.cost_price }),
        ...(validated.low_stock_threshold !== undefined && { low_stock_threshold: validated.low_stock_threshold }),
        ...(validated.is_active !== undefined && { is_active: validated.is_active }),
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error('Error updating variant:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update variant' };
  }
}
