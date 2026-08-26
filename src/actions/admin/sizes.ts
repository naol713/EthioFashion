"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth";
import { sizeCreateSchema, sizeUpdateSchema, sizeIdSchema } from "@/schemas/size";
import { z } from "zod";

export async function getSizes(type?: string) {
  const where = type ? { type: type as "CLOTHING" | "SHOE" } : {};

  return prisma.sizes.findMany({
    where,
    orderBy: { sort_order: "asc" },
  });
}

export async function getSizeById(id: string) {
  const result = sizeIdSchema.safeParse({ id });
  if (!result.success) return { success: false, error: result.error.errors };

  const size = await prisma.sizes.findUnique({ where: { id } });
  if (!size) return { success: false, error: "Size not found" };

  return { success: true, data: size };
}

export async function createSize(data: z.infer<typeof sizeCreateSchema>) {
  const admin = await requireAdmin();
  const result = sizeCreateSchema.safeParse(data);
  if (!result.success) return { success: false, error: result.error.errors };

  const size = await prisma.sizes.create({ data: result.data });

  await prisma.audit_logs.create({
    data: { actor_user_id: admin.id, action: "CREATE", entity_type: "sizes", entity_id: size.id, new_values: size },
  });

  revalidatePath("/admin/products/attributes");
  return { success: true, data: size };
}

export async function updateSize(id: string, data: z.infer<typeof sizeUpdateSchema>) {
  const admin = await requireAdmin();
  const result = sizeUpdateSchema.safeParse(data);
  if (!result.success) return { success: false, error: result.error.errors };

  const size = await prisma.sizes.update({ where: { id }, data: result.data });

  await prisma.audit_logs.create({
    data: { actor_user_id: admin.id, action: "UPDATE", entity_type: "sizes", entity_id: id, new_values: size },
  });

  revalidatePath("/admin/products/attributes");
  return { success: true, data: size };
}

export async function deleteSize(id: string) {
  const admin = await requireAdmin();
  const idResult = sizeIdSchema.safeParse({ id });
  if (!idResult.success) return { success: false, error: idResult.error.errors };

  const variantCount = await prisma.product_variants.count({ where: { size_id: id } });
  if (variantCount > 0) return { success: false, error: "Cannot delete size with variants" };

  await prisma.sizes.delete({ where: { id } });

  await prisma.audit_logs.create({
    data: { actor_user_id: admin.id, action: "DELETE", entity_type: "sizes", entity_id: id },
  });

  revalidatePath("/admin/products/attributes");
  return { success: true };
}