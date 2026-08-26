'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function getAuditLogs() {
  await requireAdmin();
  return prisma.audit_logs.findMany({ orderBy: { created_at: 'desc' }, take: 100 });
}