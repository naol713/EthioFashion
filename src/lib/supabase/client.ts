import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client for browser components
// This client is used in client components only and does not have elevated privileges
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Type augmentation for browser client
declare global {
  interface Window {
    Supabase: {
      createClient: typeof createBrowserClient;
    };
  }
}