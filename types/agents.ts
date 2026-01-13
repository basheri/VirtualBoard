import { AgentRole } from '../lib/ai/agents';

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  systemPrompt: string;
}