import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side operations.
 * Uses the anon key to ensure RLS policies are respected.
 * 
 * @returns A Supabase client configured for server-side use with proper cookie handling.
 * @example
 * ```ts
 * const supabase = await createServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * if (!user) {
 *   redirect('/login');
 * }
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle server component context where cookies are read-only
          }
        },
      },
    }
  );
}