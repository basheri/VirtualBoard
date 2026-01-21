import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { storeDocumentEmbedding } from '@/lib/ai/embeddings';
import { uploadRateLimit, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { z } from 'zod';
import pdfParse from 'pdf-parse';

// Constants - GAP-003
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

// Validation schema - GAP-002
const uploadRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  projectId: z.string().uuid('Invalid project ID'),
});

export async function POST(req: NextRequest) {
  let documentId: string | null = null;

  try {
    const supabase = await createServerClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - GAP-004
    const rateLimitResult = await checkRateLimit(user.id, uploadRateLimit);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Upload rate limit exceeded. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetAt: new Date(rateLimitResult.reset).toISOString(),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;

    // Basic field validation
    if (!file || !title || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, or projectId' },
        { status: 400 }
      );
    }

    // Server-side validation - GAP-002
    const validation = uploadRequestSchema.safeParse({ title, projectId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((e: z.ZodIssue) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // File size validation - GAP-003
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        },
        { status: 413 } // Payload Too Large
      );
    }

    // File type validation - GAP-003
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF files are supported.',
          allowedTypes: ALLOWED_FILE_TYPES,
          receivedType: file.type,
        },
        { status: 415 } // Unsupported Media Type
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

    // Use atomic transaction RPC - GAP-005
    const { data: docId, error: rpcError } = await supabase.rpc(
      'upload_document_with_transaction',
      {
        p_project_id: projectId,
        p_title: title,
        p_content: textContent,
        p_file_type: 'pdf',
        p_file_size: file.size,
      }
    );

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      throw new Error(`Failed to create document: ${rpcError.message}`);
    }

    documentId = docId;

    // Generate and store embeddings (with built-in rollback on failure)
    try {
      if (!documentId) {
        throw new Error('Document ID is null after creation');
      }
      await storeDocumentEmbedding(documentId, textContent, projectId, title);
    } catch (embeddingError) {
      console.error('Embedding error:', embeddingError);
      // Rollback: delete the document
      if (documentId) {
        await supabase.from('documents').delete().eq('id', documentId);
      }
      throw new Error('Failed to generate embeddings. Document has been removed.');
    }

    return NextResponse.json({ success: true, documentId });
  } catch (error: unknown) {
    console.error('Upload handler error:', error);

    // Additional cleanup if document exists but wasn't cleaned up
    if (documentId) {
      try {
        const supabase = await createServerClient();
        await supabase.from('documents').delete().eq('id', documentId);
        console.log(`Cleaned up orphaned document: ${documentId}`);
      } catch (cleanupError) {
        console.error('Failed to cleanup document:', cleanupError);
      }
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
