import { describe, it, expect } from 'vitest';
import { projectSchema, createProjectSchema } from './project';

describe('projectSchema', () => {
    const validProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Project',
        description: 'A test project description',
        strategy: 'GROWTH' as const,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('should validate a correct project', () => {
        const result = projectSchema.safeParse(validProject);
        expect(result.success).toBe(true);
    });

    it('should validate all strategy types', () => {
        const strategies = ['GROWTH', 'SAFETY', 'BALANCED'] as const;
        for (const strategy of strategies) {
            const result = projectSchema.safeParse({ ...validProject, strategy });
            expect(result.success).toBe(true);
        }
    });

    it('should reject invalid strategy', () => {
        const result = projectSchema.safeParse({ ...validProject, strategy: 'INVALID' });
        expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for id', () => {
        const result = projectSchema.safeParse({ ...validProject, id: 'not-a-uuid' });
        expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
        const result = projectSchema.safeParse({ ...validProject, title: '' });
        expect(result.success).toBe(false);
    });

    it('should accept optional description', () => {
        const { description, ...projectWithoutDesc } = validProject;
        const result = projectSchema.safeParse(projectWithoutDesc);
        expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
        const result = projectSchema.safeParse({ ...validProject, created_at: 'not-a-date' });
        expect(result.success).toBe(false);
    });
});

describe('createProjectSchema', () => {
    const validCreateProject = {
        title: 'New Project',
        strategy: 'BALANCED' as const,
    };

    it('should validate minimal create project data', () => {
        const result = createProjectSchema.safeParse(validCreateProject);
        expect(result.success).toBe(true);
    });

    it('should accept optional description', () => {
        const result = createProjectSchema.safeParse({
            ...validCreateProject,
            description: 'Optional description',
        });
        expect(result.success).toBe(true);
    });

    it('should reject title longer than 100 characters', () => {
        const result = createProjectSchema.safeParse({
            ...validCreateProject,
            title: 'a'.repeat(101),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('100');
        }
    });

    it('should reject description longer than 500 characters', () => {
        const result = createProjectSchema.safeParse({
            ...validCreateProject,
            description: 'a'.repeat(501),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('500');
        }
    });

    it('should reject empty title', () => {
        const result = createProjectSchema.safeParse({
            ...validCreateProject,
            title: '',
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing strategy', () => {
        const result = createProjectSchema.safeParse({ title: 'Test' });
        expect(result.success).toBe(false);
    });
});
