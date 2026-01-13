import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  strategy: z.enum(['GROWTH', 'SAFETY', 'BALANCED']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  strategy: z.enum(['GROWTH', 'SAFETY', 'BALANCED']),
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;