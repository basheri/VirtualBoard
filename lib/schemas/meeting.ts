import { z } from 'zod';
import { MeetingStrategy } from '../ai/agents';

export const meetingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Meeting title is required'),
  strategy: MeetingStrategy,
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
  project_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(100, 'Title must be less than 100 characters'),
  strategy: MeetingStrategy,
  agentIds: z.array(z.string()).min(1, 'At least one agent must be selected'),
});

export type Meeting = z.infer<typeof meetingSchema>;
export type CreateMeeting = z.infer<typeof createMeetingSchema>;