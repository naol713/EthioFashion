'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^\+251[0-9]{9}$/, 'Phone must be Ethiopian format: +251XXXXXXXXX')
    .or(z.literal('')),
});

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const parsed = profileSchema.safeParse({
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.profiles.update({
      where: { user_id: user.id },
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone || null,
      },
    });

    revalidatePath('/account');
    revalidatePath('/account/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}