import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createMeetingAction } from './meetings';

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
    createServerClient: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Meeting Server Actions', () => {
    const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
    };

    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerClient as Mock).mockResolvedValue(mockSupabase);
    });

    describe('createMeetingAction', () => {
        const validMeetingData = {
            title: 'Strategy Meeting',
            strategy: 'GROWTH' as const,
            agentIds: ['cfo', 'cto'],
        };

        it('should throw error when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(
                createMeetingAction('project-id', validMeetingData)
            ).rejects.toThrow('Unauthorized');
        });

        it('should validate input data and reject empty title', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            await expect(
                createMeetingAction('project-id', {
                    title: '',
                    strategy: 'GROWTH',
                    agentIds: ['cfo'],
                })
            ).rejects.toThrow();
        });

        it('should validate input data and reject empty agentIds', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            await expect(
                createMeetingAction('project-id', {
                    title: 'Test Meeting',
                    strategy: 'GROWTH',
                    agentIds: [],
                })
            ).rejects.toThrow();
        });

        it('should throw error when project is not found', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockProjectSelect = {
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue(mockProjectSelect),
            });

            await expect(
                createMeetingAction('invalid-project-id', validMeetingData)
            ).rejects.toThrow('Project not found or access denied');
        });

        it('should create meeting and meeting_agents when authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockProjectSelect = {
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'project-id', user_id: mockUser.id },
                    error: null,
                }),
            };

            const mockMeetingInsert = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'new-meeting-id' },
                    error: null,
                }),
            };

            const mockMeetingAgentsInsert = vi.fn().mockResolvedValue({ error: null });

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'projects') {
                    return { select: vi.fn().mockReturnValue(mockProjectSelect) };
                }
                if (table === 'meetings') {
                    return { insert: vi.fn().mockReturnValue(mockMeetingInsert) };
                }
                if (table === 'meeting_agents') {
                    return { insert: mockMeetingAgentsInsert };
                }
                return {};
            });

            const result = await createMeetingAction('project-id', validMeetingData);

            expect(result).toEqual({ id: 'new-meeting-id' });
            expect(mockMeetingAgentsInsert).toHaveBeenCalledWith([
                { meeting_id: 'new-meeting-id', agent_id: 'cfo' },
                { meeting_id: 'new-meeting-id', agent_id: 'cto' },
            ]);
        });

        it('should throw error when meeting insert fails', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockProjectSelect = {
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'project-id', user_id: mockUser.id },
                    error: null,
                }),
            };

            const mockMeetingInsert = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Insert failed' },
                }),
            };

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'projects') {
                    return { select: vi.fn().mockReturnValue(mockProjectSelect) };
                }
                if (table === 'meetings') {
                    return { insert: vi.fn().mockReturnValue(mockMeetingInsert) };
                }
                return {};
            });

            await expect(
                createMeetingAction('project-id', validMeetingData)
            ).rejects.toThrow('Insert failed');
        });
    });
});
