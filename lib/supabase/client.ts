import { createBrowserClient as createClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side operations.
 * Uses the anon key to ensure RLS policies are respected.
 * 
 * @returns A Supabase client configured for browser-side use.
 * @example
 * ```ts
 * const supabase = createBrowserClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}