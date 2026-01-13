import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ProjectSettingsForm } from '@/components/projects/ProjectSettingsForm';

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">
          Manage your project configuration and data
        </p>
      </div>

      <ProjectSettingsForm project={project} />
    </div>
  );
}
