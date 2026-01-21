-- Migration: Add missing RLS policies for document_embeddings
-- This fixes a security gap where update/delete operations were not covered

-- Add update policy for document_embeddings
CREATE POLICY "Users can update embeddings for their projects" ON public.document_embeddings
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Add delete policy for document_embeddings
CREATE POLICY "Users can delete embeddings for their projects" ON public.document_embeddings
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Add missing select policy for document_embeddings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_embeddings' 
    AND policyname = 'Users can view embeddings for their projects'
  ) THEN
    CREATE POLICY "Users can view embeddings for their projects" ON public.document_embeddings
      FOR SELECT USING (
        project_id IN (
          SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add missing insert policy for document_embeddings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_embeddings' 
    AND policyname = 'Users can create embeddings for their projects'
  ) THEN
    CREATE POLICY "Users can create embeddings for their projects" ON public.document_embeddings
      FOR INSERT WITH CHECK (
        project_id IN (
          SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add moddatetime extension for auto-updating updated_at fields
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Add updated_at triggers for tables that have the column
CREATE OR REPLACE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_meetings
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_documents
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
