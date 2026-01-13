import { z } from 'zod';

export const documentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Document title is required'),
  content: z.string(),
  file_type: z.enum(['pdf', 'txt', 'docx']),
  file_size: z.number().positive(),
  project_id: z.string().uuid(),
  embedding_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(200, 'Title must be less than 200 characters'),
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB'),
});

export type Document = z.infer<typeof documentSchema>;
export type UploadDocument = z.infer<typeof uploadDocumentSchema>;