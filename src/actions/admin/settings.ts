'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function getSettings() {
  await requireAdmin();
  return prisma.store_settings.findMany({ orderBy: { key: 'asc' } });
}

export async function saveSetting(key: string, value: string) {
  const admin = await requireAdmin();
  const normalizedKey = key.trim();
  if (!normalizedKey) return { success: false, error: 'Setting key is required' };
  await prisma.store_settings.upsert({ where: { key: normalizedKey }, update: { value, updated_by: admin.id, updated_at: new Date() }, create: { key: normalizedKey, value, updated_by: admin.id, updated_at: new Date() } });
  revalidatePath('/admin/settings');
  return { success: true };
}