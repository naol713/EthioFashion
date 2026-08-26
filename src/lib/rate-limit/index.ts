type LimitResult = { success: boolean; remaining: number; reset: number };
const memory = new Map<string, { count: number; reset: number }>();

export async function checkRateLimit(identifier: string, limit = 20, windowMs = 60_000): Promise<LimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const key = `ratelimit:${identifier}`;
    const response = await fetch(`${url}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify([['INCR', key], ['EXPIRE', key, Math.ceil(windowMs / 1000)]]) });
    if (response.ok) {
      const data = await response.json() as Array<{ result?: number }>;
      const count = Number(data[0]?.result ?? 1);
      return { success: count <= limit, remaining: Math.max(0, limit - count), reset: Date.now() + windowMs };
    }
  }

  const now = Date.now();
  const current = memory.get(identifier);
  if (!current || current.reset <= now) {
    const reset = now + windowMs;
    memory.set(identifier, { count: 1, reset });
    return { success: true, remaining: limit - 1, reset };
  }
  current.count += 1;
  return { success: current.count <= limit, remaining: Math.max(0, limit - current.count), reset: current.reset };
}

export async function enforceRateLimit(identifier: string, limit?: number, windowMs?: number) {
  const result = await checkRateLimit(identifier, limit, windowMs);
  if (!result.success) {
    const error = new Error('Too many requests. Please try again later.');
    error.name = 'RateLimitError';
    throw error;
  }
  return result;
}