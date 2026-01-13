'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function inviteMemberAction(email: string, role: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Simulate invite
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true };
}
