import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, storeDocumentEmbedding } from '@/lib/ai/embeddings';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { documentId, content, projectId, title } = await req.json();
    
    if (!documentId || !content || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, content, projectId' },
        { status: 400 }
      );
    }
    
    await storeDocumentEmbedding(documentId, content, projectId, title || 'Untitled');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}