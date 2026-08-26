import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return { supabaseUrl, supabaseAnonKey, serviceRoleKey };
}

export function hasSupabaseConfig() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Server-side Supabase client for Server Components and Server Actions
// This client respects the user's authentication session
export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // This can happen in middleware or during static rendering
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // This can happen in middleware or during static rendering
          }
        },
      },
    }
  );
}

// Service role client for trusted server-side operations
// This bypasses RLS and should only be used in carefully controlled contexts
export async function createServiceRoleClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase service role key is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Service role client should not modify cookies
        },
        remove() {
          // Service role client should not modify cookies
        },
      },
    }
  );
}