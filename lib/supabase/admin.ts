import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service role privileges.
 * This client bypasses Row Level Security (RLS) and should only be used
 * for administrative operations that require elevated permissions.
 * 
 * @throws {Error} If SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not configured
 * @returns A Supabase client with admin privileges
 * 
 * @example
 * ```ts
 * // Only use for admin operations like user management
 * const adminClient = createAdminClient();
 * await adminClient.auth.admin.listUsers();
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in your environment variables.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations require the service role key. ' +
      'Please set it in your environment variables.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
