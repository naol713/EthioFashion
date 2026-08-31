"use server";

import { prisma } from "@/lib/db/prisma";
import {
  productSchema,
  updateProductSchema,
  type ProductInput,
  type UpdateProductInput,
} from "@/schemas/product";
import {
  InventoryTransactionType,
  ProductGender,
  ProductStatus,
  SizeType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export interface ProductFilterParams {
  categorySlug?: string;
  brandSlug?: string;
  gender?: ProductGender;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: "featured" | "newest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

const sampleProducts = [
  {
    id: "p1",
    name: "Royal Habesha Kemis",
    slug: "royal-habesha-kemis",
    short_description:
      "Pure cotton handwoven Ethiopian dress with gold border embroidery.",
    description:
      "Authentic handwoven Ethiopian dress woven from pure organic cotton with intricate gold embroidery.",
    gender: "FEMALE",
    featured: true,
    category: { id: "c1", name: "Women's Dresses", slug: "women" },
    brand: { id: "b1", name: "Habesha Threads", slug: "habesha-threads" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        alt_text: "Habesha Kemis",
      },
    ],
    variants: [
      {
        id: "v1",
        sku: "RHK-GLD-M",
        price: 4500,
        compare_at_price: 5200,
        color: { name: "Gold", hex_code: "#D4AF37" },
        size: { name: "M" },
        inventory: {
          quantity: 10,
          reserved_quantity: 0,
          low_stock_threshold: 3,
        },
      },
    ],
  },
  {
    id: "p2",
    name: "Highland Leather Heritage Boots",
    slug: "highland-leather-heritage-boots",
    short_description: "Full-grain handcrafted Ethiopian leather boots.",
    description:
      "Handcrafted premium leather boots made from locally sourced Ethiopian full-grain leather.",
    gender: "MALE",
    featured: true,
    category: { id: "c2", name: "Men's Shoes", slug: "shoes" },
    brand: { id: "b2", name: "Abyssinia Kicks", slug: "abyssinia-kicks" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        alt_text: "Leather Boots",
      },
    ],
    variants: [
      {
        id: "v2",
        sku: "HLB-BRN-42",
        price: 3800,
        compare_at_price: 4200,
        color: { name: "Brown", hex_code: "#8B4513" },
        size: { name: "42" },
        inventory: {
          quantity: 5,
          reserved_quantity: 0,
          low_stock_threshold: 2,
        },
      },
    ],
  },
  {
    id: "p3",
    name: "Modern Addis Linen Blazer",
    slug: "modern-addis-linen-blazer",
    short_description: "Lightweight linen modern tailored blazer.",
    description:
      "Sharp, lightweight linen blazer designed for modern professional wear.",
    gender: "MALE",
    featured: true,
    category: { id: "c3", name: "Men's Clothing", slug: "men" },
    brand: { id: "b3", name: "Addis Couture", slug: "addis-couture" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        alt_text: "Linen Blazer",
      },
    ],
    variants: [
      {
        id: "v3",
        sku: "ALB-BLU-L",
        price: 4200,
        compare_at_price: 4800,
        color: { name: "Blue", hex_code: "#0000FF" },
        size: { name: "L" },
        inventory: {
          quantity: 8,
          reserved_quantity: 0,
          low_stock_threshold: 2,
        },
      },
    ],
  },
];

type SampleProduct = (typeof sampleProducts)[number];

function matchesProductFilters(
  product: SampleProduct,
  params: ProductFilterParams,
) {
  const { categorySlug, brandSlug, gender, query, featured } = params;

  if (featured && !product.featured) return false;
  if (gender) {
    if (gender === "MALE") {
      if (product.gender !== "MALE" && product.gender !== "UNISEX") return false;
    } else if (gender === "FEMALE") {
      if (product.gender !== "FEMALE" && product.gender !== "UNISEX") return false;
    } else {
      if (product.gender !== gender) return false;
    }
  }
  if (categorySlug && product.category?.slug !== categorySlug) return false;
  if (brandSlug && product.brand?.slug !== brandSlug) return false;

  if (query) {
    const needle = query.toLowerCase();
    const haystack = [
      product.name,
      product.description,
      product.short_description,
      product.category?.name,
      product.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(needle)) return false;
  }

  return true;
}

function sortSampleProducts(
  products: SampleProduct[],
  sortBy: ProductFilterParams["sortBy"],
) {
  const sorted = [...products];
  if (sortBy === "newest") return sorted;
  if (sortBy === "price-asc") {
    return sorted.sort(
      (a, b) =>
        Number(a.variants[0]?.price ?? 0) - Number(b.variants[0]?.price ?? 0),
    );
  }
  if (sortBy === "price-desc") {
    return sorted.sort(
      (a, b) =>
        Number(b.variants[0]?.price ?? 0) - Number(a.variants[0]?.price ?? 0),
    );
  }

  return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
}

function filterSampleProducts(params: ProductFilterParams) {
  return sortSampleProducts(
    sampleProducts.filter((product) => matchesProductFilters(product, params)),
    params.sortBy,
  );
}

async function getCategoryIdsBySlug(slug: string): Promise<string[]> {
  const category = await prisma.categories.findUnique({
    where: { slug },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
  });

  if (!category) return [];

  const ids: string[] = [category.id];

  if (category.children) {
    for (const child of category.children) {
      ids.push(child.id);
      if (child.children) {
        for (const grandChild of child.children) {
          ids.push(grandChild.id);
        }
      }
    }
  }

  return ids;
}

export async function getProducts(params: ProductFilterParams = {}) {
  try {
    const {
      categorySlug,
      brandSlug,
      gender,
      query,
      minPrice,
      maxPrice,
      featured,
      sortBy = "featured",
      page = 1,
      limit = 12,
    } = params;

    const where: any = {
      status: ProductStatus.ACTIVE,
    };

    if (featured) {
      where.featured = true;
    }

    if (gender) {
      if (gender === ProductGender.MALE) {
        where.gender = { in: [ProductGender.MALE, ProductGender.UNISEX] };
      } else if (gender === ProductGender.FEMALE) {
        where.gender = { in: [ProductGender.FEMALE, ProductGender.UNISEX] };
      } else {
        where.gender = gender;
      }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { short_description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (categorySlug) {
      const categoryIds = await getCategoryIdsBySlug(categorySlug);
      where.category_id = { in: categoryIds };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    const orderBy: any =
      sortBy === "featured"
        ? [{ featured: "desc" }, { created_at: "desc" }]
        : { created_at: "desc" };

    const dbProductsResult = await prisma.products
      .findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { sort_order: "asc" },
            take: 2,
          },
          variants: {
            where: { is_active: true },
            include: {
              color: true,
              size: true,
              inventory: true,
            },
            orderBy: { price: "asc" },
          },
        },
        orderBy,
      })
      .catch((err) => {
        console.error("Error fetching products from DB:", err);
        return [];
      });

    const dbProducts = Array.isArray(dbProductsResult) ? dbProductsResult : [];

    const dbSlugs = new Set(dbProducts.map((p: any) => p.slug));
    const dbIds = new Set(dbProducts.map((p: any) => p.id));
    const matchingSamples = sampleProducts.filter(
      (sample) =>
        !dbSlugs.has(sample.slug) &&
        !dbIds.has(sample.id) &&
        matchesProductFilters(sample, params),
    );

    let combinedProducts: any[] = [...dbProducts, ...matchingSamples];

    if (minPrice !== undefined || maxPrice !== undefined) {
      combinedProducts = combinedProducts.filter((p: any) => {
        const price = Number(p.variants?.[0]?.price ?? 0);
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        return true;
      });
    }

    if (sortBy === "price-asc") {
      combinedProducts.sort((a: any, b: any) => {
        const pA = Number(a.variants?.[0]?.price ?? 0);
        const pB = Number(b.variants?.[0]?.price ?? 0);
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      combinedProducts.sort((a: any, b: any) => {
        const pA = Number(a.variants?.[0]?.price ?? 0);
        const pB = Number(b.variants?.[0]?.price ?? 0);
        return pB - pA;
      });
    } else if (sortBy === "newest") {
      combinedProducts.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      combinedProducts.sort(
        (a: any, b: any) =>
          Number(b.featured ?? false) - Number(a.featured ?? false),
      );
    }

    const total = combinedProducts.length;
    const skip = (page - 1) * limit;
    const paginatedProducts = combinedProducts.slice(skip, skip + limit);

    return {
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    const fallbackProducts = filterSampleProducts(params);
    return {
      success: false,
      error: "Failed to fetch products",
      data: fallbackProducts,
      pagination: {
        page: 1,
        limit: 12,
        total: fallbackProducts.length,
        totalPages: 1,
      },
    };
  }
}

export async function getTotalProductCount(): Promise<number> {
  try {
    const dbProducts = await prisma.products
      .findMany({
        where: { status: ProductStatus.ACTIVE, deleted_at: null },
        select: { id: true, slug: true },
      })
      .catch(() => []);

    const dbSlugs = new Set(dbProducts.map((p: any) => p.slug));
    const dbIds = new Set(dbProducts.map((p: any) => p.id));
    const sampleCount = sampleProducts.filter(
      (s) => !dbSlugs.has(s.slug) && !dbIds.has(s.id),
    ).length;

    return dbProducts.length + sampleCount;
  } catch {
    return sampleProducts.length;
  }
}

export async function getAdminProducts(limit = 100) {
  try {
    const products = await prisma.products.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: {
          orderBy: { sort_order: "asc" },
          take: 1,
        },
        variants: {
          include: {
            color: true,
            size: true,
            inventory: true,
          },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: products,
      pagination: {
        page: 1,
        limit,
        total: products.length,
        totalPages: Math.max(1, Math.ceil(products.length / limit)),
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch admin products",
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sort_order: "asc" },
        },
        variants: {
          where: { is_active: true },
          include: {
            color: true,
            size: true,
            inventory: true,
          },
          orderBy: { price: "asc" },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: { first_name: true, last_name: true, avatar_url: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      const sample = sampleProducts.find((p) => p.slug === slug);
      if (sample) {
        return { success: true, data: sample };
      }
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error fetching product by slug:", error);

    const fallbackProduct = {
      id: "p1",
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      slug,
      description:
        "Handcrafted premium Ethiopian apparel designed with authentic traditional elements and modern elegance.",
      short_description: "Authentic Ethiopian clothing piece.",
      material: "100% Ethiopian Cotton / Genuine Leather",
      gender: ProductGender.UNISEX,
      status: ProductStatus.ACTIVE,
      featured: true,
      category: { id: "c1", name: "Fashion & Apparel", slug: "fashion" },
      brand: { id: "b1", name: "EthioFashion Brand", slug: "ethiofashion" },
      images: [
        {
          id: "i1",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
          alt_text: "Product detail",
        },
        {
          id: "i2",
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
          alt_text: "Product side view",
        },
      ],
      variants: [
        {
          id: "v1",
          sku: "SKU-SM",
          price: 3800,
          compare_at_price: 4500,
          color: { name: "Gold", hex_code: "#D4AF37" },
          size: { name: "M" },
          inventory: {
            quantity: 10,
            reserved_quantity: 0,
            low_stock_threshold: 3,
          },
        },
        {
          id: "v2",
          sku: "SKU-LG",
          price: 4200,
          compare_at_price: 4800,
          color: { name: "Black", hex_code: "#000000" },
          size: { name: "L" },
          inventory: {
            quantity: 10,
            reserved_quantity: 0,
            low_stock_threshold: 3,
          },
        },
      ],
      reviews: [],
    };

    return { success: true, data: fallbackProduct };
  }
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit });
}

// Write: Create Product (Admin)
export async function createProduct(input: ProductInput) {
  try {
    await requireAdmin();
    const validated = productSchema.parse(input);

    const existingSlug = await prisma.products.findUnique({
      where: { slug: validated.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }

    const sizeNames = Array.from(
      new Set(
        (validated.sizes || []).map((size) => size.trim()).filter(Boolean),
      ),
    );
    const sizeType = validated.size_type ?? SizeType.CLOTHING;

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.products.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          short_description: validated.short_description || null,
          category_id: validated.category_id,
          brand_id: validated.brand_id || null,
          material: validated.material || null,
          gender: validated.gender || null,
          status: validated.status,
          featured: validated.featured,
          ...(validated.imageUrl && validated.imageUrl.trim() !== ""
            ? {
                images: {
                  create: {
                    url: validated.imageUrl,
                    is_primary: true,
                    sort_order: 0,
                  },
                },
              }
            : {}),
        },
      });

      const variantSizeNames = sizeNames.length > 0 ? sizeNames : [null];
      const baseSku = validated.slug
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "-")
        .slice(0, 18);

      for (let index = 0; index < variantSizeNames.length; index += 1) {
        const sizeName = variantSizeNames[index];
        let sizeId: string | null = null;

        if (sizeName) {
          const existingSize = await tx.sizes.findFirst({
            where: {
              name: sizeName,
              type: sizeType,
            },
          });

          const sizeRecord =
            existingSize ||
            (await tx.sizes.create({
              data: {
                name: sizeName,
                type: sizeType,
                sort_order: index,
              },
            }));

          sizeId = sizeRecord.id;
        }

        const skuSuffix = sizeName
          ? sizeName
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "-")
              .slice(0, 12) || `S${index + 1}`
          : "STD";

        const createdVariant = await tx.product_variants.create({
          data: {
            product_id: createdProduct.id,
            sku: `${baseSku}-${skuSuffix}-${Date.now().toString(36).toUpperCase()}-${index + 1}`,
            size_id: sizeId,
            price: validated.price,
            compare_at_price: validated.compare_at_price || null,
            low_stock_threshold: 5,
            is_active: true,
          },
        });

        const createdInventory = await tx.inventory.create({
          data: {
            variant_id: createdVariant.id,
            quantity: validated.stock_quantity,
            reserved_quantity: 0,
            low_stock_threshold: 5,
          },
        });

        if (validated.stock_quantity > 0) {
          try {
            await tx.inventory_transactions.create({
              data: {
                // The transaction table is related to the inventory row in the current schema.
                variant_id: createdInventory.id,
                type: InventoryTransactionType.INITIAL_STOCK,
                quantity: validated.stock_quantity,
                previous_quantity: 0,
                new_quantity: validated.stock_quantity,
                note: "Initial product creation stock",
              },
            });
          } catch (inventoryError) {
            console.warn(
              "Initial stock audit log could not be written:",
              inventoryError,
            );
          }
        }
      }

      return createdProduct;
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
}

// Write: Update Product (Admin)
export async function updateProduct(input: UpdateProductInput) {
  try {
    await requireAdmin();
    const validated = updateProductSchema
      .partial()
      .extend({ id: updateProductSchema.shape.id })
      .parse(input);

    const product = await prisma.$transaction(async (tx) => {
      // 1. Update the base product properties and primary image
      const updatedProduct = await tx.products.update({
        where: { id: validated.id },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.slug && { slug: validated.slug }),
          ...(validated.description && { description: validated.description }),
          ...(validated.short_description !== undefined && {
            short_description: validated.short_description,
          }),
          ...(validated.category_id && { category_id: validated.category_id }),
          ...(validated.brand_id !== undefined && {
            brand_id: validated.brand_id,
          }),
          ...(validated.material !== undefined && {
            material: validated.material,
          }),
          ...(validated.gender !== undefined && { gender: validated.gender }),
          ...(validated.status && { status: validated.status }),
          ...(validated.featured !== undefined && {
            featured: validated.featured,
          }),
          ...(validated.imageUrl !== undefined
            ? {
                images: {
                  deleteMany: { is_primary: true },
                  ...(validated.imageUrl && validated.imageUrl.trim() !== ""
                    ? {
                        create: {
                          url: validated.imageUrl,
                          is_primary: true,
                          sort_order: 0,
                        },
                      }
                    : {}),
                },
              }
            : {}),
        },
      });

      // 2. Update pricing, inventory, and sizes if provided
      if (
        validated.price !== undefined ||
        validated.compare_at_price !== undefined ||
        validated.stock_quantity !== undefined ||
        validated.sizes !== undefined ||
        validated.size_type !== undefined
      ) {
        // Fetch existing variants
        const existingVariants = await tx.product_variants.findMany({
          where: { product_id: validated.id },
          include: { size: true, inventory: true },
        });

        // Determine size names and size type
        const sizeNames =
          validated.sizes !== undefined
            ? Array.from(
                new Set(validated.sizes.map((s) => s.trim()).filter(Boolean)),
              )
            : existingVariants
                .map((v) => v.size?.name)
                .filter((name): name is string => !!name);

        const sizeType =
          validated.size_type ||
          existingVariants[0]?.size?.type ||
          SizeType.CLOTHING;
        const price =
          validated.price !== undefined
            ? validated.price
            : existingVariants[0]?.price
              ? Number(existingVariants[0].price)
              : 0;
        const compareAtPrice =
          validated.compare_at_price !== undefined
            ? validated.compare_at_price
            : existingVariants[0]?.compare_at_price
              ? Number(existingVariants[0].compare_at_price)
              : null;
        const stockQuantity =
          validated.stock_quantity !== undefined
            ? validated.stock_quantity
            : (existingVariants[0]?.inventory?.quantity ?? 0);

        const variantSizeNames = sizeNames.length > 0 ? sizeNames : [null];
        const baseSku = (validated.slug || updatedProduct.slug)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "-")
          .slice(0, 18);

        const activeVariantIds: string[] = [];

        for (let index = 0; index < variantSizeNames.length; index += 1) {
          const sizeName = variantSizeNames[index];
          let sizeId: string | null = null;

          if (sizeName) {
            // Find or create size
            const existingSize = await tx.sizes.findFirst({
              where: { name: sizeName, type: sizeType },
            });

            const sizeRecord =
              existingSize ||
              (await tx.sizes.create({
                data: {
                  name: sizeName,
                  type: sizeType,
                  sort_order: index,
                },
              }));

            sizeId = sizeRecord.id;
          }

          // Check if variant for this size already exists
          const existingVariant = existingVariants.find((v) => {
            if (sizeId === null) return v.size_id === null;
            return v.size_id === sizeId;
          });

          if (existingVariant) {
            // Update existing variant
            const updatedVariant = await tx.product_variants.update({
              where: { id: existingVariant.id },
              data: {
                price,
                compare_at_price: compareAtPrice,
                is_active: true,
              },
            });

            activeVariantIds.push(updatedVariant.id);

            // Update inventory
            if (existingVariant.inventory) {
              const previousQty = existingVariant.inventory.quantity;
              await tx.inventory.update({
                where: { id: existingVariant.inventory.id },
                data: { quantity: stockQuantity },
              });

              if (stockQuantity !== previousQty) {
                try {
                  await tx.inventory_transactions.create({
                    data: {
                      variant_id: existingVariant.inventory.id,
                      type: InventoryTransactionType.ADJUSTMENT,
                      quantity: stockQuantity - previousQty,
                      previous_quantity: previousQty,
                      new_quantity: stockQuantity,
                      note: "Stock adjusted during product update",
                    },
                  });
                } catch (err) {
                  console.warn("Could not write inventory transaction:", err);
                }
              }
            } else {
              // Create inventory if it somehow doesn't exist
              const createdInventory = await tx.inventory.create({
                data: {
                  variant_id: existingVariant.id,
                  quantity: stockQuantity,
                  reserved_quantity: 0,
                  low_stock_threshold: 5,
                },
              });

              try {
                await tx.inventory_transactions.create({
                  data: {
                    variant_id: createdInventory.id,
                    type: InventoryTransactionType.INITIAL_STOCK,
                    quantity: stockQuantity,
                    previous_quantity: 0,
                    new_quantity: stockQuantity,
                    note: "Initial stock created during product update",
                  },
                });
              } catch (err) {
                console.warn("Could not write inventory transaction:", err);
              }
            }
          } else {
            // Create new variant
            const skuSuffix = sizeName
              ? sizeName
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "-")
                  .slice(0, 12) || `S${index + 1}`
              : "STD";

            const createdVariant = await tx.product_variants.create({
              data: {
                product_id: updatedProduct.id,
                sku: `${baseSku}-${skuSuffix}-${Date.now().toString(36).toUpperCase()}-${index + 1}`,
                size_id: sizeId,
                price,
                compare_at_price: compareAtPrice,
                low_stock_threshold: 5,
                is_active: true,
              },
            });

            activeVariantIds.push(createdVariant.id);

            const createdInventory = await tx.inventory.create({
              data: {
                variant_id: createdVariant.id,
                quantity: stockQuantity,
                reserved_quantity: 0,
                low_stock_threshold: 5,
              },
            });

            try {
              await tx.inventory_transactions.create({
                data: {
                  variant_id: createdInventory.id,
                  type: InventoryTransactionType.INITIAL_STOCK,
                  quantity: stockQuantity,
                  previous_quantity: 0,
                  new_quantity: stockQuantity,
                  note: "Initial stock created for new variant during product update",
                },
              });
            } catch (err) {
              console.warn("Could not write inventory transaction:", err);
            }
          }
        }

        // Deactivate or delete variants that are not active anymore
        const variantsToDeactivate = existingVariants.filter(
          (v) => !activeVariantIds.includes(v.id),
        );
        for (const variant of variantsToDeactivate) {
          try {
            await tx.inventory.delete({ where: { variant_id: variant.id } });
            await tx.product_variants.delete({ where: { id: variant.id } });
          } catch (deleteError) {
            // If delete fails due to foreign keys (like active orders), set is_active = false
            await tx.product_variants.update({
              where: { id: variant.id },
              data: { is_active: false },
            });
          }
        }
      }

      return updatedProduct;
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

// Write: Archive Product (Admin)
export async function archiveProduct(productId: string) {
  try {
    await requireAdmin();
    const product = await prisma.products.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ARCHIVED,
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true, data: product };
  } catch (error: any) {
    console.error("Error archiving product:", error);
    return {
      success: false,
      error: error.message || "Failed to archive product",
    };
  }
}
