import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createServerClient } from '@/lib/supabase/server';
import { recursiveTextSplit } from './rag';

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small') as any,
    value: text,
  });

  return embedding;
}

export async function storeDocumentEmbedding(
  documentId: string,
  content: string,
  projectId: string,
  title: string
): Promise<void> {
  const supabase = await createServerClient();
  
  const chunks = recursiveTextSplit(content);
  const totalChunks = chunks.length;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);
    
    const { error } = await supabase
      .from('document_embeddings')
      .insert({
        document_id: documentId,
        project_id: projectId,
        content: chunk,
        embedding,
        metadata: {
          position: i,
          totalChunks,
          documentName: title,
        },
      });

    if (error) {
      console.error('Error storing document embedding:', error);
      throw error;
    }
  }
}