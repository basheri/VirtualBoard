import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { MeetingChat } from '@/components/meetings/MeetingChat';
import { MeetingHeader } from '@/components/meetings/MeetingHeader';
import { Skeleton } from '@/components/ui/skeleton';

interface MeetingPageProps {
  params: Promise<{ projectId: string; meetingId: string }>;
}

async function getMeeting(meetingId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      project:projects(*),
      messages(*),
      meeting_agents(agent_id)
    `)
    .eq('id', meetingId)
    .single();
  
  if (error || !data) return null;
  return data;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId, projectId } = await params;
  const meeting = await getMeeting(meetingId);
  
  if (!meeting || meeting.project_id !== projectId) {
    notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <MeetingHeader
        meetingId={meetingId}
        title={meeting.title}
        strategy={meeting.strategy}
        status={meeting.status}
        agents={meeting.meeting_agents}
      />
      <Suspense fallback={<ChatSkeleton />}>
        <MeetingChat
          meetingId={meetingId}
          initialMessages={meeting.messages}
          strategy={meeting.strategy}
          agents={meeting.meeting_agents?.map((ma: { agent_id: string }) => ma.agent_id) || []}
        />
      </Suspense>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full max-w-md" />
          </div>
        </div>
      ))}
    </div>
  );
}