'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteDocumentAction(documentId: string, projectId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('project_id', projectId);

  if (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/projects/${projectId}/knowledge`);
  return { success: true };
}
