import { describe, it, expect } from 'vitest';
import { meetingSchema, createMeetingSchema } from './meeting';

describe('meetingSchema', () => {
    const validMeeting = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Strategic Planning Meeting',
        strategy: 'GROWTH' as const,
        status: 'ACTIVE' as const,
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
    };

    it('should validate a correct meeting', () => {
        const result = meetingSchema.safeParse(validMeeting);
        expect(result.success).toBe(true);
    });

    it('should validate all strategy types', () => {
        const strategies = ['GROWTH', 'SAFETY', 'BALANCED'] as const;
        for (const strategy of strategies) {
            const result = meetingSchema.safeParse({ ...validMeeting, strategy });
            expect(result.success).toBe(true);
        }
    });

    it('should validate all status types', () => {
        const statuses = ['ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
        for (const status of statuses) {
            const result = meetingSchema.safeParse({ ...validMeeting, status });
            expect(result.success).toBe(true);
        }
    });

    it('should reject invalid status', () => {
        const result = meetingSchema.safeParse({ ...validMeeting, status: 'PENDING' });
        expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for project_id', () => {
        const result = meetingSchema.safeParse({ ...validMeeting, project_id: 'invalid' });
        expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
        const result = meetingSchema.safeParse({ ...validMeeting, title: '' });
        expect(result.success).toBe(false);
    });
});

describe('createMeetingSchema', () => {
    const validCreateMeeting = {
        title: 'New Meeting',
        strategy: 'BALANCED' as const,
        agentIds: ['cfo', 'cto'],
    };

    it('should validate correct create meeting data', () => {
        const result = createMeetingSchema.safeParse(validCreateMeeting);
        expect(result.success).toBe(true);
    });

    it('should accept single agent', () => {
        const result = createMeetingSchema.safeParse({
            ...validCreateMeeting,
            agentIds: ['moderator'],
        });
        expect(result.success).toBe(true);
    });

    it('should reject empty agentIds array', () => {
        const result = createMeetingSchema.safeParse({
            ...validCreateMeeting,
            agentIds: [],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('At least one agent');
        }
    });

    it('should reject title longer than 100 characters', () => {
        const result = createMeetingSchema.safeParse({
            ...validCreateMeeting,
            title: 'a'.repeat(101),
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing strategy', () => {
        const result = createMeetingSchema.safeParse({
            title: 'Test',
            agentIds: ['cfo'],
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing agentIds', () => {
        const result = createMeetingSchema.safeParse({
            title: 'Test',
            strategy: 'GROWTH',
        });
        expect(result.success).toBe(false);
    });
});
