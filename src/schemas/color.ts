import { z } from "zod";

export const colorSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(50, "Slug too long").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code").nullable().optional(),
});

export const colorCreateSchema = colorSchema;
export const colorUpdateSchema = colorSchema.partial();
export const colorIdSchema = z.object({ id: z.string().uuid("Invalid color ID") });