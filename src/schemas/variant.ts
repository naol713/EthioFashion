import { z } from 'zod';

export const variantSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  color_id: z.string().uuid('Invalid color ID').optional().nullable(),
  size_id: z.string().uuid('Invalid size ID').optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  compare_at_price: z.number().positive().optional().nullable(),
  cost_price: z.number().positive().optional().nullable(),
  low_stock_threshold: z.number().int().nonnegative().default(5),
  initial_quantity: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

export const updateVariantSchema = variantSchema.partial().extend({
  id: z.string().uuid('Invalid variant ID'),
});

export type VariantInput = z.infer<typeof variantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
