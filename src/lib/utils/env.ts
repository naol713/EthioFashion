import { z } from 'zod';

// Environment variable validation schema
export const envSchema = z.object({
  // Required Database & Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  // Public Supabase variables (can act as fallbacks)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // Optional Third-party
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Public Application variables
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Fashion Store'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('ETB'),
  NEXT_PUBLIC_DEFAULT_DELIVERY_FEE: z.coerce.number().default(50),
  LOW_STOCK_THRESHOLD: z.coerce.number().default(5),
});

// Type inferred from schema
export type Env = z.infer<typeof envSchema>;

// Validate and parse environment variables
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment variable configuration:\n${errorDetails}\n\n` +
      `Please copy .env.example to .env and fill in the required values.`
    );
  }

  return result.data;
}

// Get validated environment variables (singleton)
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = validateEnv();
  return cachedEnv;
}

// Public environment variables (safe to expose to client)
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Fashion Store',
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'ETB',
  defaultDeliveryFee: Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_FEE) || 50,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
};