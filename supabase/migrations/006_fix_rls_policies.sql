-- Fix missing RLS policies for document_embeddings and meeting_agents tables
-- Priority 1 - GAP-001

-- ============================================
-- Document Embeddings RLS Policies
-- ============================================

-- Allow users to view embeddings for their own projects
CREATE POLICY "Users can view embeddings for their projects"
  ON public.document_embeddings FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert embeddings for their own projects
CREATE POLICY "Users can insert embeddings for their projects"
  ON public.document_embeddings FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Allow users to delete embeddings for their own projects
CREATE POLICY "Users can delete embeddings for their projects"
  ON public.document_embeddings FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Meeting Agents RLS Policies
-- ============================================

-- Allow users to view agents for their meetings
CREATE POLICY "Users can view agents for their meetings"
  ON public.meeting_agents FOR SELECT
  USING (
    meeting_id IN (
      SELECT m.id FROM public.meetings m
      JOIN public.projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Allow users to insert agents for their meetings
CREATE POLICY "Users can insert agents for their meetings"
  ON public.meeting_agents FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT m.id FROM public.meetings m
      JOIN public.projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Allow users to delete agents for their meetings
CREATE POLICY "Users can delete agents for their meetings"
  ON public.meeting_agents FOR DELETE
  USING (
    meeting_id IN (
      SELECT m.id FROM public.meetings m
      JOIN public.projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Create indexes for better RLS policy performance
CREATE INDEX IF NOT EXISTS idx_document_embeddings_project_user 
  ON public.document_embeddings(project_id);

CREATE INDEX IF NOT EXISTS idx_meeting_agents_meeting_id 
  ON public.meeting_agents(meeting_id);
