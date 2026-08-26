import { z } from 'zod';
import { ProductGender, ProductStatus, SizeType } from '@prisma/client';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional().nullable(),
  category_id: z.string().uuid('Invalid category ID'),
  brand_id: z.string().uuid('Invalid brand ID').optional().nullable(),
  material: z.string().optional().nullable(),
  gender: z.nativeEnum(ProductGender).optional().nullable(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  featured: z.boolean().default(false),
  imageUrl: z.string().url('Invalid image URL').or(z.string().length(0)).optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  compare_at_price: z.number().positive('Compare at price must be greater than 0').optional().nullable(),
  stock_quantity: z.number().int().nonnegative('Stock quantity cannot be negative'),
  size_type: z.nativeEnum(SizeType).optional().nullable(),
  sizes: z.array(z.string().min(1)).default([]),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid('Invalid product ID'),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
