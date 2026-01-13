import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { storeDocumentEmbedding } from '@/lib/ai/embeddings';
// @ts-ignore
import * as pdfParseLib from 'pdf-parse';

const pdfParse = (pdfParseLib as any).default || pdfParseLib;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !title || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    let textContent = '';
    try {
      const data = await pdfParse(buffer);
      textContent = data.text;
    } catch (parseError) {
      console.error('PDF Parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse PDF file. Ensure it is not encrypted/password protected.' },
        { status: 400 }
      );
    }

    if (!textContent.trim()) {
      return NextResponse.json(
        { error: 'No text content found in PDF. Scanned images are not supported yet.' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // 1. Store document metadata in 'documents' table
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        title: title,
        content: textContent, // Store full content for retrieval/display if needed
        file_type: 'pdf', // We only support PDF for now based on the check above
        file_size: file.size,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      throw new Error('Failed to save document metadata');
    }

    // 2. Chunk text and generate embeddings
    // We use the recursive text splitter implemented in storeDocumentEmbedding
    await storeDocumentEmbedding(document.id, textContent, projectId, title);

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error: unknown) {
    console.error('Upload handler error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
