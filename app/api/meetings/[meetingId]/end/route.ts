import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateSummary, storeMeetingMemory } from '@/lib/ai/memories';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const supabase = await createServerClient();

    // 1. Fetch meeting details and messages
    const { data: meeting } = await supabase
      .from('meetings')
      .select('project_id, status')
      .eq('id', meetingId)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Meeting is already ended' }, { status: 400 });
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('content, sender_name, sender_role')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages to summarize' }, { status: 400 });
    }

    // 2. Generate summary and decision using AI
    const { summary, decision } = await generateSummary(messages);

    // 3. Store in meeting_memories table with embedding
    await storeMeetingMemory(meetingId, meeting.project_id, summary, decision);

    // 4. Update meeting status to COMPLETED
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ status: 'COMPLETED' })
      .eq('id', meetingId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      summary,
      decision,
    });
  } catch (error: any) {
    console.error('Error ending meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
