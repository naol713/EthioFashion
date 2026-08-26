import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  image_url: z.string().url('Must be a valid URL').optional().nullable(),
  parent_id: z.string().uuid('Invalid parent category ID').optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
});

export const categoryCreateSchema = categorySchema;
export const categoryUpdateSchema = updateCategorySchema;
export const categoryIdSchema = z.object({ id: z.string().uuid('Invalid category ID') });

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;