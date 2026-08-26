'use server';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Get user's wishlist
export async function getWishlist() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', items: [] };

  try {
    const wishlist = await prisma.wishlist_items.findMany({
      where: {
        wishlist: {
          user_id: user.id,
        },
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            images: true,
            variants: {
              include: {
                color: true,
                size: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, items: wishlist };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { success: false, error: 'Failed to fetch wishlist', items: [] };
  }
}

// Check if product is in wishlist
export async function isInWishlist(productId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  try {
    const item = await prisma.wishlist_items.findFirst({
      where: {
        product_id: productId,
        wishlist: {
          user_id: user.id,
        },
      },
    });
    return !!item;
  } catch {
    return false;
  }
}

// Add to wishlist
export async function addToWishlist(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Check if already in wishlist
    const wishlist = await prisma.wishlists.findUnique({
      where: { user_id: user.id },
    });

    const existing = wishlist
      ? await prisma.wishlist_items.findFirst({
          where: {
            wishlist_id: wishlist.id,
            product_id: productId,
          },
        })
      : null;

    if (existing) {
      return { success: false, error: 'Already in wishlist' };
    }

    const userWishlist = wishlist ?? await prisma.wishlists.create({
      data: { user_id: user.id },
    });

    await prisma.wishlist_items.create({
      data: {
        wishlist_id: userWishlist.id,
        product_id: productId,
      },
    });

    revalidatePath('/wishlist');
    revalidatePath('/account/wishlist');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: 'Failed to add to wishlist' };
  }
}

// Remove from wishlist
export async function removeFromWishlist(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const item = await prisma.wishlist_items.findFirst({
      where: {
        product_id: productId,
        wishlist: {
          user_id: user.id,
        },
      },
    });

    if (!item) {
      return { success: false, error: 'Item not found in wishlist' };
    }

    await prisma.wishlist_items.delete({
      where: { id: item.id },
    });

    revalidatePath('/wishlist');
    revalidatePath('/account/wishlist');
    revalidatePath('/products');
    revalidatePath(`/products/${item.product_id}`);

    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: 'Failed to remove from wishlist' };
  }
}

// Toggle wishlist (add if not exists, remove if exists)
export async function toggleWishlist(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', inWishlist: false };

  try {
    const existing = await prisma.wishlist_items.findFirst({
      where: {
        product_id: productId,
        wishlist: {
          user_id: user.id,
        },
      },
    });

    if (existing) {
      await prisma.wishlist_items.delete({
        where: { id: existing.id },
      });
      revalidatePath('/wishlist');
      revalidatePath('/account/wishlist');
      revalidatePath('/products');
      return { success: true, inWishlist: false };
    } else {
      const wishlist = await prisma.wishlists.upsert({
        where: { user_id: user.id },
        update: {},
        create: { user_id: user.id },
      });

      await prisma.wishlist_items.create({
        data: {
          wishlist_id: wishlist.id,
          product_id: productId,
        },
      });
      revalidatePath('/wishlist');
      revalidatePath('/account/wishlist');
      revalidatePath('/products');
      return { success: true, inWishlist: true };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { success: false, error: 'Failed to toggle wishlist', inWishlist: false };
  }
}

// Get wishlist count
export async function getWishlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  try {
    return await prisma.wishlist_items.count({
      where: {
        wishlist: { user_id: user.id },
      },
    });
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return 0;
  }
}
