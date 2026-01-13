import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MeetingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectMeetingsPage({ params }: MeetingsPageProps) {
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
    .select('*, meetings(*)')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href={`/dashboard/projects/${projectId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground">
              History and scheduled meetings for {project.title}
            </p>
          </div>
          <Link href={`/dashboard/projects/${projectId}/meetings/new`}>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {project.meetings?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No meetings found</h3>
              <p className="text-muted-foreground mb-6">Start a new discussion with your virtual board.</p>
              <Link href={`/dashboard/projects/${projectId}/meetings/new`}>
                <Button>
                  Create First Meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {project.meetings.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              ).map((meeting: any) => (
                <Link
                  key={meeting.id}
                  href={`/dashboard/projects/${projectId}/meetings/${meeting.id}`}
                >
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.created_at).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
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
    </div>
  );
}
