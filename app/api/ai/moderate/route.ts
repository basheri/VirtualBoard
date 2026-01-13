import { NextRequest, NextResponse } from 'next/server';
import { generateModeratorDecision } from '@/lib/ai/moderator';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { meetingId, topic, opinions, strategy } = await req.json();
    
    const supabase = await createServerClient();
    
    // Get project context
    const { data: meeting } = await supabase
      .from('meetings')
      .select('project_id')
      .eq('id', meetingId)
      .single();
    
    let projectContext = '';
    if (meeting?.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('title, description')
        .eq('id', meeting.project_id)
        .single();
      
      if (project) {
        projectContext = `Project: ${project.title}\n${project.description || ''}`;
      }
    }
    
    const decision = await generateModeratorDecision(
      topic,
      opinions,
      strategy,
      projectContext
    );
    
    return NextResponse.json(decision);
  } catch (error) {
    console.error('Error generating moderator decision:', error);
    return NextResponse.json(
      { error: 'Failed to generate decision' },
      { status: 500 }
    );
  }
}