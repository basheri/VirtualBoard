import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { MeetingStrategy, STRATEGY_WEIGHTS, AgentRole } from './agents';

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const ModeratorDecisionSchema = z.object({
  summary: z.string().describe('Summary of the discussion and different viewpoints'),
  recommendation: z.string().describe('The recommended decision based on strategy'),
  reasoning: z.string().describe('Why this recommendation aligns with the meeting strategy'),
  weights: z.record(z.string(), z.number()).describe('Weight given to each agent opinion'),
  confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  requiresHumanInput: z.boolean().describe('Whether human decision-maker input is needed'),
  actionItems: z.array(z.string()).describe('Specific next steps'),
});

export type ModeratorDecision = z.infer<typeof ModeratorDecisionSchema>;

interface AgentOpinion {
  agentRole: AgentRole;
  opinion: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export async function generateModeratorDecision(
  topic: string,
  opinions: AgentOpinion[],
  strategy: MeetingStrategy,
  projectContext?: string
): Promise<ModeratorDecision> {
  const weights = STRATEGY_WEIGHTS[strategy];
  
  const prompt = `
You are moderating a board meeting with the following strategy: ${strategy}

Topic under discussion: ${topic}

${projectContext ? `Project Context:\n${projectContext}\n` : ''}

Agent Opinions:
${opinions.map(o => `- ${o.agentRole}: ${o.opinion} (Sentiment: ${o.sentiment})`).join('\n')}

Strategy Weights:
${Object.entries(weights).map(([role, weight]) => `- ${role}: ${weight}`).join('\n')}

Based on the meeting strategy (${strategy}), synthesize these opinions and provide a recommendation.
Weight each opinion according to the strategy - for ${strategy} strategy, prioritize ${
    strategy === 'GROWTH' ? 'marketing and technology' : 
    strategy === 'SAFETY' ? 'legal and financial concerns' : 
    'balanced input from all advisors'
  }.
`;

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.0-flash-001') as any,
    schema: ModeratorDecisionSchema,
    prompt,
  });

  return object;
}