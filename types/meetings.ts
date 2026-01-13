import { AgentRole, MeetingStrategy } from '../lib/ai/agents';

export interface Message {
  id: string;
  content: string;
  senderRole: 'USER' | 'AGENT';
  senderName: string;
  senderAgentId?: string;
  meetingId: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  strategy: MeetingStrategy;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  projectId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  agents?: string[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  strategy: MeetingStrategy;
  userId: string;
  createdAt: string;
  updatedAt: string;
  meetings?: Meeting[];
}