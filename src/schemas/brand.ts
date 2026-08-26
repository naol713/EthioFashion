import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().nullable(),
  is_active: z.boolean().default(true),
});

export const updateBrandSchema = brandSchema.partial().extend({
  id: z.string().uuid('Invalid brand ID'),
});

export const brandCreateSchema = brandSchema;
export const brandUpdateSchema = updateBrandSchema;
export const brandIdSchema = z.object({ id: z.string().uuid('Invalid brand ID') });

export type BrandInput = z.infer<typeof brandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;