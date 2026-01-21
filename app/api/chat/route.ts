import { createServerClient } from '@/lib/supabase/server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, convertToModelMessages } from 'ai'
import type { LanguageModel } from 'ai'
import { getAgentById } from '@/lib/ai/agents'
import { searchDocuments } from '@/lib/ai/rag'
import { searchMemories } from '@/lib/ai/memories'
import { SupabaseClient } from '@supabase/supabase-js'
import { validateRequest } from '@/lib/validation/server'
import { chatRateLimit, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

/** Chat message structure for the API */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

// Server-side validation schema - GAP-002
const chatRequestSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000, 'Message too long (max 10,000 characters)'),
  })).min(1, 'At least one message required'),
  strategy: z.enum(['GROWTH', 'SAFETY', 'BALANCED']),
  agents: z.array(z.string()).min(1, 'At least one agent required'),
});

export async function POST(req: Request) {
  console.log('✅ /api/chat route hit')

  try {
    const supabase = await createServerClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - GAP-004
    const rateLimitResult = await checkRateLimit(user.id, chatRateLimit);
    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetAt: new Date(rateLimitResult.reset).toISOString(),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await req.json()
    console.log('✅ Request body received:', JSON.stringify(body).slice(0, 100))

    // Server-side validation - GAP-002
    const validation = validateRequest(chatRequestSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { meetingId, messages, strategy, agents: agentIds } = validation.data;

    console.log(`Processing chat for meeting ${meetingId} with ${agentIds.length} agents and ${messages.length} messages.`);

    // GAP-009: Fetch meeting with version for optimistic locking
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('project_id, version')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return Response.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === 'user').pop();

    let ragContext = '';
    let contextMissing = false;
    if (meeting?.project_id && lastUserMessage?.content) {
      const [docs, memories] = await Promise.all([
        searchDocuments(meeting.project_id, lastUserMessage.content),
        searchMemories(meeting.project_id, lastUserMessage.content),
      ]);

      const combined = [docs, memories].filter(Boolean).join('\n\n');
      if (!combined.trim()) {
        contextMissing = true;
        ragContext = 'No relevant documents or memories were found for this query. The board should base their advice on general expertise while noting the lack of specific project context.';
      } else {
        ragContext = combined;
      }
    }

    // Build multi-agent prompt
    const activeAgents = agentIds
      .map((id: string) => getAgentById(id))
      .filter((agent): agent is NonNullable<typeof agent> => !!agent);

    // GAP-006: Strategy Weight Orchestration
    const strategyDescription = {
      GROWTH: {
        focus: 'aggressive scaling, market capture, and high-risk/high-reward opportunities',
        primary: 'CMO and CTO',
        secondary: 'CFO (for funding)',
        tone: 'bold and visionary'
      },
      SAFETY: {
        focus: 'risk mitigation, legal compliance, and financial stability',
        primary: 'LEGAL and CFO',
        secondary: 'CTO (for security)',
        tone: 'cautious and pragmatic'
      },
      BALANCED: {
        focus: 'sustainable growth, operational efficiency, and moderate risk',
        primary: 'All agents equally',
        secondary: 'Moderator (for consensus)',
        tone: 'professional and objective'
      }
    }[strategy];

    const systemPrompt = `You are the AI Moderator for a Virtual Advisory Board.
Current Meeting Strategy: ${strategy}
Strategic Focus: ${strategyDescription.focus}
Primary Influencers: ${strategyDescription.primary}
Discussion Tone: ${strategyDescription.tone}

Board Context:
${contextMissing ? '⚠️ NOTICE: ' : ''}${ragContext}

Active Board Members:
${activeAgents.map((agent) => `- ${agent.name} (${agent.role}): ${agent.systemPrompt.split('\n')[1]}`).join('\n')}

INSTRUCTIONS:
1. Language: ALWAYS respond in the same language as the user's last message.
2. Format:
   - Begin with the Moderator introducing the strategic angle (${strategyDescription.focus}).
   - Then, have 2-3 agents provide expert opinions. 
   - GAP-006 (Strategy Weights): The ${strategyDescription.primary} should lead the discussion and have more influence.
   - Enforce disagreement: Ensure agents challenge each other if roles conflict (e.g., CFO vs CMO).
   - End with a concrete Moderator decision/recommendation.
3. RAG Handling (GAP-008): ${contextMissing ? 'Explicitly mention that no relevant project documents were found and you are relying on general board expertise.' : 'Synthesize the provided knowledge base into the expert opinions.'}
4. Speaker Headers: Use clear bold headers (e.g., "**Chief Financial Officer:**").

Example Output Structure:
**Moderator**: [Strategic Intro]
**[Primary Agent]**: [Lead Opinion]
**[Supporting/Conflicting Agent]**: [Secondary Opinion / Challenge]
**Moderator**: [Final Decision]`;

    // Note: OpenRouter provider returns a compatible model but TypeScript types don't fully align
    // with AI SDK's LanguageModel interface. This cast is safe as the runtime behavior is correct.
    const result = await streamText({
      model: openrouter('google/gemini-2.0-flash-001') as LanguageModel,
      system: systemPrompt,
      messages: await convertToModelMessages(messages as any),
      onFinish: async ({ text }) => {
        // GAP-009: Perform optimistic lock update on meeting
        const { error: lockError } = await supabase
          .from('meetings')
          .update({
            version: meeting.version + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', meetingId)
          .eq('version', meeting.version);

        if (lockError) {
          console.error('Optimistic lock failed for meeting:', meetingId);
        }

        // Save the AI's full response to the database
        try {
          await supabase.from('messages').insert({
            meeting_id: meetingId,
            content: text,
            sender_role: 'AGENT',
            sender_name: 'Virtual Board',
          });

          // GAP-007: Generate and store structured moderator decision
          const topic = lastUserMessage?.content || 'Meeting discussion';

          // Import moderator utility
          const { generateModeratorDecision } = await import('@/lib/ai/moderator');

          // Map the discussion into a single "opinion" for the decision engine
          const decision = await generateModeratorDecision(
            topic,
            [{ agentRole: 'MODERATOR', opinion: text, sentiment: 'NEUTRAL' }],
            strategy,
            ragContext
          );

          await supabase.from('meeting_decisions').insert({
            meeting_id: meetingId,
            project_id: meeting.project_id,
            summary: decision.summary,
            recommendation: decision.recommendation,
            reasoning: decision.reasoning,
            weights: decision.weights,
            confidence_level: decision.confidenceLevel,
            requires_human_input: decision.requiresHumanInput,
            action_items: decision.actionItems,
          });

          console.log(`✅ Moderator decision stored for meeting ${meetingId}`);
        } catch (saveError) {
          console.error('Failed to save AI response or decision:', saveError);
        }
      },
    });

    // Save user message immediately
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

async function saveUserMessage(supabase: SupabaseClient, meetingId: string, messages: ChatMessage[]) {
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
