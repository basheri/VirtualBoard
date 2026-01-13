-- Add metadata column to document_embeddings
ALTER TABLE document_embeddings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_document_embeddings_metadata 
ON document_embeddings USING GIN (metadata);
