export function captureException(error: unknown) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn || typeof window !== 'undefined') return;
  void fetch(dsn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: error instanceof Error ? error.message : String(error), level: 'error', platform: 'javascript' }) }).catch(() => undefined);
}