'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteDocumentAction(documentId: string, projectId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership via RLS or explicit check (RLS is safer but explicit check is good for UX feedback)
  // We assume RLS policies are in place, but we can also check if the user is a member of the project
  // For now, simple delete.

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('project_id', projectId); // Extra safety

  if (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/projects/${projectId}/knowledge`);
  return { success: true };
}
