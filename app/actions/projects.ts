'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createProjectSchema, type CreateProject } from '@/lib/schemas/project';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(data: CreateProject) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized: Please sign in to create a project');
    }

  // Validate data
  const validated = createProjectSchema.parse(data);

  // Check profile existence
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    console.log(`Profile missing for user ${user.id}, attempting recovery...`);
    
    // Use admin client to create profile if it's missing (bypassing RLS)
    const adminSupabase = createAdminClient();
    
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Admin key present:', hasServiceKey);

    if (hasServiceKey) {
        const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
        });
        
        if (insertError) {
            console.error('Failed to create profile via admin:', insertError);
            throw new Error(`Failed to create user profile: ${insertError.message}`);
        }
        console.log('Profile created successfully via admin client');
    } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY missing, falling back to client insert (may fail due to RLS)');
        // Fallback: try normal insert
        const { error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
        });
         if (insertError) {
            console.error('Failed to create profile via client:', insertError);
            throw new Error('Failed to create user profile. Please contact support.');
        }
    }
  }

  // Create Project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: validated.title,
      description: validated.description,
      strategy: validated.strategy,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

    revalidatePath('/dashboard/projects');
    return { id: project.id };
  } catch (error: any) {
    console.error('Error in createProjectAction:', error);
    throw new Error(error.message || 'Failed to create project');
  }
}

export async function updateProjectAction(projectId: string, data: CreateProject) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate data
  const validated = createProjectSchema.parse(data);

  const { error } = await supabase
    .from('projects')
    .update({
      title: validated.title,
      description: validated.description,
      strategy: validated.strategy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectAction(projectId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/projects');
  return { success: true };
}
