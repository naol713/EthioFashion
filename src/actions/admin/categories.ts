"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth";
import { categoryCreateSchema, categoryUpdateSchema, categoryIdSchema } from "@/schemas/category";
import { z } from "zod";

export async function getCategories(options?: { includeInactive?: boolean; parentId?: string }) {
  const where: Record<string, unknown> = {};

  if (!options?.includeInactive) {
    where.is_active = true;
  }

  if (options?.parentId) {
    where.parent_id = options.parentId;
  }

  return prisma.categories.findMany({
    where,
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sort_order: "asc" },
  });
}

export async function getCategoryTree() {
  const categories = await prisma.categories.findMany({
    where: { is_active: true },
    include: {
      children: {
        where: { is_active: true },
        include: {
          children: {
            where: { is_active: true },
          },
        },
      },
    },
    orderBy: { sort_order: "asc" },
  });

  return categories;
}

export async function getCategoryById(id: string) {
  const result = categoryIdSchema.safeParse({ id });
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  const category = await prisma.categories.findUnique({
    where: { id },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  return { success: true, data: category };
}

export async function createCategory(data: z.infer<typeof categoryCreateSchema>) {
  const admin = await requireAdmin();

  const result = categoryCreateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  // Check for duplicate slug
  const existing = await prisma.categories.findUnique({
    where: { slug: result.data.slug },
  });

  if (existing) {
    return { success: false, error: "A category with this slug already exists" };
  }

  // Validate parent category if provided
  if (result.data.parent_id) {
    const parent = await prisma.categories.findUnique({
      where: { id: result.data.parent_id },
    });

    if (!parent) {
      return { success: false, error: "Parent category not found" };
    }
  }

  const category = await prisma.categories.create({
    data: {
      ...result.data,
      image_url: result.data.image_url || null,
    },
  });

  // Log audit
  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "CREATE",
      entity_type: "categories",
      entity_id: category.id,
      new_values: category,
    },
  });

  revalidatePath("/admin/products/categories");
  revalidatePath("/shop");

  return { success: true, data: category };
}

export async function updateCategory(id: string, data: z.infer<typeof categoryUpdateSchema>) {
  const admin = await requireAdmin();

  const idResult = categoryIdSchema.safeParse({ id });
  if (!idResult.success) {
    return { success: false, error: idResult.error.issues };
  }

  const result = categoryUpdateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues };
  }

  const category = await prisma.categories.update({
    where: { id },
    data: result.data,
  });

  // Log audit
  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "UPDATE",
      entity_type: "categories",
      entity_id: id,
      new_values: category,
    },
  });

  revalidatePath("/admin/products/categories");
  revalidatePath("/shop");

  return { success: true, data: category };
}

export async function deleteCategory(id: string) {
  const admin = await requireAdmin();

  const idResult = categoryIdSchema.safeParse({ id });
  if (!idResult.success) {
    return { success: false, error: idResult.error.issues };
  }

  // Check for child categories
  const children = await prisma.categories.count({
    where: { parent_id: id },
  });

  if (children > 0) {
    return { success: false, error: "Cannot delete category with child categories" };
  }

  // Check for products in this category
  const productCount = await prisma.products.count({
    where: { category_id: id },
  });

  if (productCount > 0) {
    return { success: false, error: "Cannot delete category with products" };
  }

  await prisma.categories.delete({
    where: { id },
  });

  // Log audit
  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: "DELETE",
      entity_type: "categories",
      entity_id: id,
    },
  });

  revalidatePath("/admin/products/categories");
  revalidatePath("/shop");

  return { success: true };
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  const admin = await requireAdmin();

  const category = await prisma.categories.update({
    where: { id },
    data: { is_active: isActive },
  });

  // Log audit
  await prisma.audit_logs.create({
    data: {
      actor_user_id: admin.id,
      action: isActive ? "ACTIVATE" : "DEACTIVATE",
      entity_type: "categories",
      entity_id: id,
    },
  });

  revalidatePath("/admin/products/categories");
  revalidatePath("/shop");

  return { success: true, data: category };
}

export async function reorderCategories(orders: { id: string; sort_order: number }[]) {
  const admin = await requireAdmin();

  await prisma.$transaction(
    orders.map((order) =>
      prisma.categories.update({
        where: { id: order.id },
        data: { sort_order: order.sort_order },
      })
    )
  );

  revalidatePath("/admin/products/categories");
  revalidatePath("/shop");

  return { success: true };
}