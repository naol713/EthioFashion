"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth";
import { brandCreateSchema, brandUpdateSchema, brandIdSchema } from "@/schemas/brand";
import { z } from "zod";

export async function getBrands(options?: { includeInactive?: boolean }) {
  const where: Record<string, unknown> = {};

  if (!options?.includeInactive) {
    where.is_active = true;
  }

  return prisma.brands.findMany({
    where,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBrandById(id: string) {
  const result = brandIdSchema.safeParse({ id });
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  const brand = await prisma.brands.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!brand) {
    return { success: false, error: "Brand not found" };
  }

  return { success: true, data: brand };
}

export async function createBrand(data: z.infer<typeof brandCreateSchema>) {
  const admin = await requireAdmin();

  const result = brandCreateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  const existing = await prisma.brands.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing) {
    return { success: false, error: "A brand with this slug already exists" };
  }

  const brand = await prisma.brands.create({
    data: {
      ...result.data,
      logo_url: result.data.logo_url || null,
    },
  });

  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "CREATE",
      entity_type: "brands",
      entity_id: brand.id,
      new_values: brand,
    },
  });

  revalidatePath("/admin/products/brands");
  revalidatePath("/shop");

  return { success: true, data: brand };
}

export async function updateBrand(id: string, data: z.infer<typeof brandUpdateSchema>) {
  const admin = await requireAdmin();

  const idResult = brandIdSchema.safeParse({ id });
  if (!idResult.success) {
    return { success: false, error: idResult.error.issues };
  }

  const result = brandUpdateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  const brand = await prisma.brands.update({
    where: { id },
    data: result.data,
  });

  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "UPDATE",
      entity_type: "brands",
      entity_id: id,
      new_values: brand,
    },
  });

  revalidatePath("/admin/products/brands");
  revalidatePath("/shop");

  return { success: true, data: brand };
}

export async function deleteBrand(id: string) {
  const admin = await requireAdmin();

  const idResult = brandIdSchema.safeParse({ id });
  if (!idResult.success) {
    return { success: false, error: idResult.error.issues };
  }

  const productCount = await prisma.products.count({
    where: { brand_id: id },
  });

  if (productCount > 0) {
    return { success: false, error: "Cannot delete brand with products" };
  }

  await prisma.brands.delete({
    where: { id },
  });

  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "DELETE",
      entity_type: "brands",
      entity_id: id,
    },
  });

  revalidatePath("/admin/products/brands");
  revalidatePath("/shop");

  return { success: true };
}

export async function toggleBrandStatus(id: string, isActive: boolean) {
  const admin = await requireAdmin();

  const brand = await prisma.brands.update({
    where: { id },
    data: { is_active: isActive },
  });

  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: isActive ? "ACTIVATE" : "DEACTIVATE",
      entity_type: "brands",
      entity_id: id,
    },
  });

  revalidatePath("/admin/products/brands");
  revalidatePath("/shop");

  return { success: true, data: brand };
}