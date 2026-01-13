import { createServerClient } from '@/lib/supabase/server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, convertToModelMessages } from 'ai'
import { getAgentById, STRATEGY_WEIGHTS, MeetingStrategy } from '@/lib/ai/agents'
import { searchDocuments } from '@/lib/ai/rag'
import { searchMemories } from '@/lib/ai/memories'
import { SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function POST(req: Request) {
  console.log('✅ /api/chat route hit')
  
  try {
    const body = await req.json()
    console.log('✅ Request body received:', JSON.stringify(body).slice(0, 100))
    
    const { messages, meetingId, strategy, agents: agentIds } = body

    if (!meetingId) {
      console.log('❌ No meetingId provided')
      return Response.json({ error: 'Meeting ID required' }, { status: 400 })
    }

    const supabase = await createServerClient();
  
    // Get project context from RAG
    const { data: meeting } = await supabase
      .from('meetings')
      .select('project_id')
      .eq('id', meetingId)
      .single();
    
    const lastUserMessage = messages.filter((m: { role: string; content: string }) => m.role === 'user').pop();
    
    let ragContext = '';
    if (meeting?.project_id && lastUserMessage?.content) {
      const [docs, memories] = await Promise.all([
        searchDocuments(meeting.project_id, lastUserMessage.content),
        searchMemories(meeting.project_id, lastUserMessage.content),
      ]);
      
      ragContext = [docs, memories].filter(Boolean).join('\n\n');
    }

    // Build multi-agent prompt
    const activeAgents = agentIds.map((id: string) => getAgentById(id)).filter(Boolean);
    // const weights = STRATEGY_WEIGHTS[strategy as MeetingStrategy];
    
    const systemPrompt = `You are the AI Moderator for a Virtual Advisory Board.
Meeting Strategy: ${strategy} (Weighting: ${strategy === 'GROWTH' ? 'Aggressive Growth' : strategy === 'SAFETY' ? 'Conservative Risk Management' : 'Balanced'})

Your goal is to simulate a realistic, turn-based board meeting discussion.
Current Topic/Context: ${ragContext ? `\nRelevant Knowledge Base:\n${ragContext}\n` : 'No specific documents found.'}

Active Board Members:
${activeAgents.map((agent: { name: string; role: string; systemPrompt: string }) => `- ${agent.name} (${agent.role}): ${agent.systemPrompt.split('\n')[1]}`).join('\n')}

INSTRUCTIONS:
1. Language: ALWAYS respond in the same language as the user's last message. If the user speaks Arabic, the entire board speaks Arabic. If English, English.
2. Format:
   - Begin with the Moderator introducing the angle based on the strategy.
   - Then, have 2-3 relevant agents provide their specific expert opinions.
   - Ensure agents DISAGREE if their roles conflict (e.g., CFO vs CMO in Safety strategy).
   - End with the Moderator summarizing and giving a concrete recommendation.
3. Style: Use clear headers for each speaker (e.g., "**Chief Financial Officer:**").
4. Weights: Give more airtime and influence to agents favored by the ${strategy} strategy.

Example Output Structure:
**Moderator**: [Intro]
**CMO**: [Opinion]
**CFO**: [Counter-opinion]
**Moderator**: [Decision]`;

    const result = await streamText({
      model: openrouter('google/gemini-2.0-flash-001') as any,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        // Save the AI's full response to the database
        try {
          await supabase.from('messages').insert({
            meeting_id: meetingId,
            content: text,
            sender_role: 'AGENT',
            sender_name: 'Virtual Board', // Or 'Moderator'
          });
        } catch (saveError) {
          console.error('Failed to save AI response:', saveError);
        }
      },
    });

    // Save user message immediately (await to ensure completion)
    await saveUserMessage(supabase, meetingId, messages);

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('❌ Chat API error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveUserMessage(supabase: SupabaseClient, meetingId: string, messages: any[]) {
  try {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      await supabase.from('messages').insert({
        meeting_id: meetingId,
        content: lastMessage.content,
        sender_role: 'USER',
        sender_name: 'User',
      });
    }
  } catch (error) {
    console.error('Error saving user message:', error);
  }
}
