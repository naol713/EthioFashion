'use server';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, '');
}

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((value) => /^\+251[0-9]{9}$/.test(value), {
      message: 'Phone must be Ethiopian format: +251XXXXXXXXX',
    }),
  region: z.string().trim().min(1, 'Region is required'),
  city: z.string().trim().min(1, 'City is required'),
  subCity: z.string().trim().optional().or(z.literal('')).transform((value) => value || undefined),
  woreda: z.string().trim().optional().or(z.literal('')).transform((value) => value || undefined),
  streetAddress: z.string().trim().min(1, 'Street address is required'),
  building: z.string().trim().optional().or(z.literal('')).transform((value) => value || undefined),
  additionalInfo: z.string().trim().optional().or(z.literal('')).transform((value) => value || undefined),
  label: z.string().trim().optional().or(z.literal('')).transform((value) => value || undefined),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// Get all addresses for user
export async function getAddresses() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', addresses: [] };

  try {
    const addresses = await prisma.addresses.findMany({
      where: { user_id: user.id },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    return { success: true, addresses };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return { success: false, error: 'Failed to fetch addresses', addresses: [] };
  }
}

// Get single address
export async function getAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated', address: null };

  try {
    const address = await prisma.addresses.findFirst({
      where: { id, user_id: user.id },
    });

    if (!address) {
      return { success: false, error: 'Address not found', address: null };
    }

    return { success: true, address };
  } catch (error) {
    console.error('Error fetching address:', error);
    return { success: false, error: 'Failed to fetch address', address: null };
  }
}

// Create new address
export async function createAddress(data: AddressInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // Validate input
    const validated = addressSchema.parse(data);

    // If this is default, unset other defaults
    if (validated.isDefault) {
      await prisma.addresses.updateMany({
        where: { user_id: user.id },
        data: { is_default: false },
      });
    }

    const address = await prisma.addresses.create({
      data: {
        user_id: user.id,
        recipient_name: validated.fullName,
        phone: validated.phone,
        region: validated.region,
        city: validated.city,
        sub_city: validated.subCity || null,
        woreda: validated.woreda || null,
        street_address: validated.streetAddress,
        building: validated.building || null,
        additional_info: validated.additionalInfo || null,
        label: validated.label || null,
        is_default: validated.isDefault,
      },
    });

    revalidatePath('/account/addresses');

    return { success: true, address };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Error creating address:', error);
    return { success: false, error: 'Failed to create address' };
  }
}

// Update address
export async function updateAddress(id: string, data: Partial<AddressInput>) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // Check ownership
    const existing = await prisma.addresses.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return { success: false, error: 'Address not found' };
    }

    // If setting as default, unset others
    if (data.isDefault) {
      await prisma.addresses.updateMany({
        where: { user_id: user.id },
        data: { is_default: false },
      });
    }

    const address = await prisma.addresses.update({
      where: { id },
      data: {
        recipient_name: data.fullName,
        phone: data.phone,
        region: data.region,
        city: data.city,
        sub_city: data.subCity,
        woreda: data.woreda,
        street_address: data.streetAddress,
        building: data.building,
        additional_info: data.additionalInfo,
        label: data.label,
        is_default: data.isDefault,
      },
    });

    revalidatePath('/account/addresses');

    return { success: true, address };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: 'Failed to update address' };
  }
}

// Delete address
export async function deleteAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const existing = await prisma.addresses.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return { success: false, error: 'Address not found' };
    }

    await prisma.addresses.delete({
      where: { id },
    });

    revalidatePath('/account/addresses');

    return { success: true };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: 'Failed to delete address' };
  }
}

// Set default address
export async function setDefaultAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const existing = await prisma.addresses.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return { success: false, error: 'Address not found' };
    }

    // Unset all defaults
    await prisma.addresses.updateMany({
      where: { user_id: user.id },
      data: { is_default: false },
    });

    // Set new default
    await prisma.addresses.update({
      where: { id },
      data: { is_default: true },
    });

    revalidatePath('/account/addresses');

    return { success: true };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { success: false, error: 'Failed to set default address' };
  }
}
