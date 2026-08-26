'use server';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Get or create cart for user
async function getOrCreateCart(userId: string) {
  let cart = await prisma.carts.findUnique({
    where: { user_id: userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                  images: true,
                },
              },
              color: true,
              size: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.carts.create({
      data: { user_id: userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    category: true,
                    brand: true,
                    images: true,
                  },
                },
                color: true,
                size: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

// Get cart with calculated totals
export async function getCart() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', cart: null };

  try {
    const cart = await getOrCreateCart(user.id);

    // Calculate totals
    let subtotal = 0;
    const items = cart.items.map(item => {
      const variantPrice = Number(item.variant.price);
      const itemTotal = variantPrice * item.quantity;
      subtotal += itemTotal;

      return {
        ...item,
        variant: {
          ...item.variant,
          price: variantPrice,
        },
      };
    });

    return {
      success: true,
      cart: {
        ...cart,
        items,
        subtotal,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { success: false, error: 'Failed to fetch cart', cart: null };
  }
}

// Add item to cart
export async function addToCart(variantId: string, quantity: number = 1) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // Check if variant exists and has stock
    const variant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        inventory: true,
        product: true,
      },
    });

    if (!variant) {
      return { success: false, error: 'Product variant not found' };
    }

    const stockQuantity = variant.inventory?.quantity || 0;
    if (stockQuantity < quantity) {
      return { success: false, error: 'Insufficient stock' };
    }

    // Get or create cart
    const cart = await getOrCreateCart(user.id);

    // Check if item already in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        variant_id: variantId,
      },
    });

    if (existingItem) {
      // Check new total quantity
      const newQuantity = existingItem.quantity + quantity;
      if (stockQuantity < newQuantity) {
        return { success: false, error: 'Insufficient stock' };
      }

      await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          variant_id: variantId,
          quantity,
        },
      });
    }

    revalidatePath('/cart');
    revalidatePath('/products');

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: 'Failed to add to cart' };
  }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const cart = await prisma.carts.findUnique({
      where: { user_id: user.id },
    });

    if (!cart) {
      return { success: false, error: 'Cart not found' };
    }

    const item = await prisma.cart_items.findUnique({
      where: { id: itemId },
      include: {
        variant: {
          include: { inventory: true },
        },
      },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (item.cart_id !== cart.id) {
      return { success: false, error: 'Item not found' };
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cart_items.delete({ where: { id: itemId } });
    } else {
      // Check stock
      const stockQuantity = item.variant.inventory?.quantity || 0;
      if (stockQuantity < quantity) {
        return { success: false, error: 'Insufficient stock' };
      }

      await prisma.cart_items.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    revalidatePath('/cart');

    return { success: true };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, error: 'Failed to update cart item' };
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const cart = await prisma.carts.findUnique({
      where: { user_id: user.id },
    });

    if (!cart) {
      return { success: false, error: 'Cart not found' };
    }

    const item = await prisma.cart_items.findFirst({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    await prisma.cart_items.delete({
      where: { id: itemId },
    });

    revalidatePath('/cart');

    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error: 'Failed to remove from cart' };
  }
}

// Clear cart
export async function clearCart() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    await prisma.carts.update({
      where: { user_id: user.id },
      data: {
        items: {
          deleteMany: {},
        },
      },
    });

    revalidatePath('/cart');

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
}

// Get cart count (for header badge)
export async function getCartCount() {
  const user = await getCurrentUser();
  if (!user) return 0;

  const cart = await prisma.carts.findUnique({
    where: { user_id: user.id },
    include: {
      items: true,
    },
  });

  if (!cart) return 0;

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}