'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createMeetingSchema, type CreateMeeting } from '@/lib/schemas/meeting';
import { revalidatePath } from 'next/cache';

export async function createMeetingAction(projectId: string, data: CreateMeeting) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = createMeetingSchema.parse(data);

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({
      title: validated.title,
      strategy: validated.strategy,
      project_id: projectId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (validated.agentIds?.length) {
    const meetingAgents = validated.agentIds.map(agentId => ({
      meeting_id: meeting.id,
      agent_id: agentId,
    }));
    await supabase.from('meeting_agents').insert(meetingAgents);
  }

  revalidatePath(`/dashboard/projects/${projectId}/meetings`);
  return { id: meeting.id };
}
