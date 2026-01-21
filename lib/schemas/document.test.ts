import { describe, it, expect } from 'vitest';
import { documentSchema, uploadDocumentSchema } from './document';

describe('documentSchema', () => {
    const validDocument = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Financial Report Q4',
        content: 'This is the document content...',
        file_type: 'pdf' as const,
        file_size: 1024000, // ~1MB
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
    };

    it('should validate a correct document', () => {
        const result = documentSchema.safeParse(validDocument);
        expect(result.success).toBe(true);
    });

    it('should validate all file types', () => {
        const fileTypes = ['pdf', 'txt', 'docx'] as const;
        for (const file_type of fileTypes) {
            const result = documentSchema.safeParse({ ...validDocument, file_type });
            expect(result.success).toBe(true);
        }
    });

    it('should reject invalid file type', () => {
        const result = documentSchema.safeParse({ ...validDocument, file_type: 'xlsx' });
        expect(result.success).toBe(false);
    });

    it('should reject zero file size', () => {
        const result = documentSchema.safeParse({ ...validDocument, file_size: 0 });
        expect(result.success).toBe(false);
    });

    it('should reject negative file size', () => {
        const result = documentSchema.safeParse({ ...validDocument, file_size: -100 });
        expect(result.success).toBe(false);
    });

    it('should accept optional embedding_id', () => {
        const result = documentSchema.safeParse({
            ...validDocument,
            embedding_id: '550e8400-e29b-41d4-a716-446655440002',
        });
        expect(result.success).toBe(true);
    });

    it('should accept missing embedding_id', () => {
        const { embedding_id, ...docWithoutEmbedding } = { ...validDocument, embedding_id: undefined };
        const result = documentSchema.safeParse(docWithoutEmbedding);
        expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
        const result = documentSchema.safeParse({ ...validDocument, title: '' });
        expect(result.success).toBe(false);
    });

    it('should reject invalid project_id UUID', () => {
        const result = documentSchema.safeParse({ ...validDocument, project_id: 'invalid' });
        expect(result.success).toBe(false);
    });
});

describe('uploadDocumentSchema', () => {
    // Note: Tests involving File objects require a browser or jsdom environment
    // These tests verify the schema structure and basic validation

    it('should reject empty title', () => {
        // Create a mock file-like object for testing schema structure
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        const result = uploadDocumentSchema.safeParse({
            title: '',
            file: mockFile,
        });
        expect(result.success).toBe(false);
    });

    it('should reject title longer than 200 characters', () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        const result = uploadDocumentSchema.safeParse({
            title: 'a'.repeat(201),
            file: mockFile,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('200');
        }
    });

    it('should accept valid title and file', () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        const result = uploadDocumentSchema.safeParse({
            title: 'Valid Document Title',
            file: mockFile,
        });
        expect(result.success).toBe(true);
    });

    it('should reject file larger than 10MB', () => {
        // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
        const largeContent = new ArrayBuffer(10 * 1024 * 1024 + 1);
        const mockFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

        const result = uploadDocumentSchema.safeParse({
            title: 'Large File',
            file: mockFile,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('10MB');
        }
    });

    it('should accept file exactly 10MB', () => {
        const content = new ArrayBuffer(10 * 1024 * 1024);
        const mockFile = new File([content], 'exact10mb.pdf', { type: 'application/pdf' });

        const result = uploadDocumentSchema.safeParse({
            title: 'Exact 10MB File',
            file: mockFile,
        });
        expect(result.success).toBe(true);
    });
});
