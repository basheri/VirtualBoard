import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MessageSquare, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

async function getProject(projectId: string, userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      meetings(*),
      documents(count)
    `)
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const project = await getProject(projectId, user.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/projects/${projectId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Badge 
            variant={project.strategy === 'GROWTH' ? 'default' : 
                    project.strategy === 'SAFETY' ? 'destructive' : 'secondary'}
          >
            {project.strategy} Strategy
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.meetings?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.documents?.[0]?.count || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Meetings</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.meetings?.filter((m: { status: string }) => m.status === 'ACTIVE').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{project.strategy}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Meetings</CardTitle>
                <Link href={`/dashboard/projects/${projectId}/meetings`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View All
                </Link>
              </div>
              <Link href={`/dashboard/projects/${projectId}/meetings/new`}>
                <Button size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  New Meeting
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {project.meetings?.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meetings yet</p>
                <Link href={`/dashboard/projects/${projectId}/meetings/new`}>
                  <Button variant="outline" className="mt-4">
                    Create First Meeting
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {project.meetings.map((meeting: any) => (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/projects/${projectId}/meetings/${meeting.id}`}
                  >
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{meeting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={meeting.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Knowledge Base</CardTitle>
              <Link href={`/dashboard/projects/${projectId}/knowledge`}>
                <Button size="sm" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Documents
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents uploaded</p>
              <Link href={`/dashboard/projects/${projectId}/knowledge`}>
                <Button variant="outline" className="mt-4">
                  Upload Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}