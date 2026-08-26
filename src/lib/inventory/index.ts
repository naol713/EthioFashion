import { prisma } from '@/lib/db/prisma';
import { InventoryTransactionType } from '@prisma/client';

export interface InventoryCheckResult {
  isAvailable: boolean;
  availableQuantity: number;
  totalQuantity: number;
  reservedQuantity: number;
}

// Check real-time inventory availability for a variant
export async function checkInventory(variantId: string, requestedQuantity = 1): Promise<InventoryCheckResult> {
  const inventory = await prisma.inventory.findUnique({
    where: { variant_id: variantId },
  });

  if (!inventory) {
    return {
      isAvailable: false,
      availableQuantity: 0,
      totalQuantity: 0,
      reservedQuantity: 0,
    };
  }

  const availableQuantity = Math.max(0, inventory.quantity - inventory.reserved_quantity);
  const isAvailable = availableQuantity >= requestedQuantity;

  return {
    isAvailable,
    availableQuantity,
    totalQuantity: inventory.quantity,
    reservedQuantity: inventory.reserved_quantity,
  };
}

// Low stock status check
export async function isLowStock(variantId: string): Promise<boolean> {
  const inventory = await prisma.inventory.findUnique({
    where: { variant_id: variantId },
  });

  if (!inventory) return true;

  const available = inventory.quantity - inventory.reserved_quantity;
  return available <= inventory.low_stock_threshold;
}

// Transactional Stock Adjustments (Restock, Sale, Return, Damage, Adjustment)
export async function adjustInventory(params: {
  variantId: string;
  type: InventoryTransactionType;
  quantityChange: number;
  note?: string;
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
}) {
  const { variantId, type, quantityChange, note, referenceType, referenceId, createdBy } = params;

  return await prisma.$transaction(async (tx) => {
    const current = await tx.inventory.findUnique({
      where: { variant_id: variantId },
    });

    if (!current) {
      throw new Error(`Inventory record not found for variant: ${variantId}`);
    }

    const previousQuantity = current.quantity;
    const newQuantity = Math.max(0, previousQuantity + quantityChange);

    const updated = await tx.inventory.update({
      where: { variant_id: variantId },
      data: {
        quantity: newQuantity,
      },
    });

    // Record audit transaction
    const transaction = await tx.inventory_transactions.create({
      data: {
        variant_id: variantId,
        type,
        quantity: Math.abs(quantityChange),
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        note: note || null,
        reference_type: referenceType || null,
        reference_id: referenceId || null,
        created_by: createdBy || null,
      },
    });

    return { inventory: updated, transaction };
  });
}
