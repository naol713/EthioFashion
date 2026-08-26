import { z } from "zod";
import { SizeType } from "@prisma/client";

export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required").max(20, "Name too long"),
  type: z.nativeEnum(SizeType),
  sort_order: z.number().int().min(0).default(0),
});

export const sizeCreateSchema = sizeSchema;
export const sizeUpdateSchema = sizeSchema.partial();
export const sizeIdSchema = z.object({ id: z.string().uuid("Invalid size ID") });

export type SizeInput = z.infer<typeof sizeSchema>;