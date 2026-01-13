import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createServerClient } from '@/lib/supabase/server';

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export interface DocumentChunk {
  id: string;
  content: string;
  documentId: string;
  embedding?: number[];
  metadata?: {
    page?: number;
    section?: string;
    position?: number;
  };
}

export interface EmbeddingResult {
  embedding: number[];
  tokensUsed: number;
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  documentId: string;
  metadata?: Record<string, unknown>;
  title?: string;
}

export interface ChunkConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
}

const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', ' ']
};

export function recursiveTextSplit(
  text: string,
  config: ChunkConfig = DEFAULT_CHUNK_CONFIG
): string[] {
  const { chunkSize, chunkOverlap, separators } = config;
  
  // If text is small enough, return as single chunk
  if (text.length <= chunkSize) {
    return [text.trim()].filter(Boolean);
  }
  
  // Find best separator
  let bestSeparator = '';
  for (const sep of separators) {
    if (text.includes(sep)) {
      bestSeparator = sep;
      break;
    }
  }
  
  // Split and recursively process
  const chunks: string[] = [];
  const parts = bestSeparator ? text.split(bestSeparator) : [text];
  
  let currentChunk = '';
  for (const part of parts) {
    const potential = currentChunk + (currentChunk ? bestSeparator : '') + part;
    
    if (potential.length <= chunkSize) {
      currentChunk = potential;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // Handle overlap
      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + part;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function searchDocuments(
  projectId: string,
  query: string,
  limit: number = 5
): Promise<string> {
  const supabase = await createServerClient();
  
  // Generate embedding for the query
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small') as any,
    value: query,
  });

  // Search for similar documents using vector similarity
  const { data: documents, error } = await supabase.rpc(
    'search_documents_by_embedding',
    {
      project_id: projectId,
      query_embedding: embedding,
      similarity_threshold: 0.5, // Lowered slightly to ensure results
      match_count: limit,
    }
  );

  if (error) {
    console.error('Error searching documents:', error);
    return '';
  }

  if (!documents || documents.length === 0) {
    return '';
  }

  // Format the results for context
  const context = (documents as SearchResult[]).map((doc, index) => 
    `[Document ${index + 1}: ${doc.title || 'Untitled'}]\n${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}`
  ).join('\n\n');

  return `Relevant project context:\n${context}`;
}