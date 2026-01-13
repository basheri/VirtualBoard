import { embed, generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export interface Memory {
  id: string;
  meetingId: string;
  projectId: string;
  summary: string;
  embedding?: number[];
  createdAt: string;
}

export interface MemorySearchResult {
  id: string;
  summary: string;
  similarity: number;
  meetingId: string;
  createdAt: string;
  decision: string;
}

export async function generateSummary(messages: { sender_name: string; content: string }[]): Promise<{ summary: string; decision: string }> {
  const { object } = await generateObject({
    model: openrouter('google/gemini-2.0-flash-001') as any,
    schema: z.object({
      summary: z.string().describe('A concise summary of the meeting discussion.'),
      decision: z.string().describe('The final decision or recommendation reached.'),
    }),
    prompt: `Analyze the following meeting transcript and provide a summary and the final decision/recommendation.
    
    Transcript:
    ${messages.map(m => `${m.sender_name}: ${m.content}`).join('\n')}
    `,
  });
  
  return object;
}

export async function storeMeetingMemory(
  meetingId: string,
  projectId: string,
  summary: string,
  decision: string
): Promise<void> {
  const supabase = await createServerClient();
  
  // Combine summary and decision for embedding context
  const textToEmbed = `Summary: ${summary}\nDecision: ${decision}`;
  
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small') as any,
    value: textToEmbed,
  });

  const { error } = await supabase
    .from('meeting_memories')
    .insert({
      meeting_id: meetingId,
      project_id: projectId,
      summary,
      decision,
      embedding,
    });

  if (error) {
    console.error('Error storing meeting memory:', error);
    throw error;
  }
}

export async function searchMemories(
  projectId: string,
  query: string,
  limit: number = 3
): Promise<string> {
  const supabase = await createServerClient();
  
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small') as any,
    value: query,
  });

  const { data: memories, error } = await supabase.rpc(
    'search_memories_by_embedding',
    {
      project_id: projectId,
      query_embedding: embedding,
      similarity_threshold: 0.6,
      match_count: limit,
    }
  );

  if (error) {
    console.error('Error searching memories:', error);
    return '';
  }

  if (!memories || memories.length === 0) {
    return '';
  }

  return (memories as MemorySearchResult[]).map((mem, index) => 
    `[Past Meeting Decision ${index + 1}]\nSummary: ${mem.summary}\nDecision: ${mem.decision}`
  ).join('\n\n');
}
