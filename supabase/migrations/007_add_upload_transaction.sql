-- Add atomic transaction function for document upload
-- Priority 1 - GAP-005

-- ============================================
-- Atomic Document Upload Function
-- ============================================

CREATE OR REPLACE FUNCTION upload_document_with_transaction(
  p_project_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_file_type TEXT,
  p_file_size INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_document_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Verify user owns the project
  IF NOT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = p_project_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Project not found or access denied';
  END IF;
  
  -- Insert document
  INSERT INTO public.documents (
    project_id, 
    title, 
    content, 
    file_type, 
    file_size
  )
  VALUES (
    p_project_id, 
    p_title, 
    p_content, 
    p_file_type, 
    p_file_size
  )
  RETURNING id INTO v_document_id;
  
  -- Return the document ID
  RETURN v_document_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically in plpgsql
    RAISE EXCEPTION 'Failed to upload document: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upload_document_with_transaction(UUID, TEXT, TEXT, TEXT, INTEGER) 
  TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION upload_document_with_transaction IS 
  'Atomically creates a document with ownership verification. Used to prevent orphaned documents.';
