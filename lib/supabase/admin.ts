import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Admin operations may fail.');
    // Return a client that will fail if used, or null? 
    // Better to throw here if this function is called, but for safety let's return a client that might just fail on auth if key is missing/bad.
    // Actually, if key is missing, createClient throws or behaves badly.
  }

  return createClient(
    supabaseUrl!,
    serviceRoleKey || '', // Fallback to empty string to avoid crash, but requests will fail
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
