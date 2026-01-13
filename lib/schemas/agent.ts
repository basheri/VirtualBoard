import { z } from 'zod';
import { AgentRole } from '../ai/agents';

export const agentSchema = z.object({
  id: z.string(),
  role: AgentRole,
  name: z.string(),
  nameAr: z.string(),
  icon: z.string(),
  color: z.string(),
  systemPrompt: z.string(),
});

export type Agent = z.infer<typeof agentSchema>;