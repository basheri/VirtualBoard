import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createProjectAction, updateProjectAction } from './projects';

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
    createServerClient: vi.fn(),
}));

// Mock the admin client
vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Project Server Actions', () => {
    const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
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

    describe('createProjectAction', () => {
        it('should throw error when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(
                createProjectAction({
                    title: 'Test Project',
                    strategy: 'GROWTH',
                })
            ).rejects.toThrow('Unauthorized');
        });

        it('should validate input data and reject invalid title', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            await expect(
                createProjectAction({
                    title: '', // Invalid - empty title
                    strategy: 'GROWTH',
                })
            ).rejects.toThrow();
        });

        it('should create project when authenticated with valid data', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            // Mock profile check
            const mockSelectChain = {
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: mockUser.id }, error: null }),
            };

            // Mock project insert
            const mockInsertChain = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'new-project-id' },
                    error: null,
                }),
            };

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return { select: vi.fn().mockReturnValue(mockSelectChain) };
                }
                if (table === 'projects') {
                    return { insert: vi.fn().mockReturnValue(mockInsertChain) };
                }
                return {};
            });

            const result = await createProjectAction({
                title: 'Test Project',
                strategy: 'GROWTH',
                description: 'Test description',
            });

            expect(result).toEqual({ id: 'new-project-id' });
        });

        it('should throw error when database insert fails', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockSelectChain = {
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: mockUser.id }, error: null }),
            };

            const mockInsertChain = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
                }),
            };

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return { select: vi.fn().mockReturnValue(mockSelectChain) };
                }
                if (table === 'projects') {
                    return { insert: vi.fn().mockReturnValue(mockInsertChain) };
                }
                return {};
            });

            await expect(
                createProjectAction({
                    title: 'Test Project',
                    strategy: 'BALANCED',
                })
            ).rejects.toThrow('Database error');
        });
    });

    describe('updateProjectAction', () => {
        it('should throw error when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(
                updateProjectAction('project-id', {
                    title: 'Updated Title',
                    strategy: 'SAFETY',
                })
            ).rejects.toThrow('Unauthorized');
        });

        it('should update project successfully', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockUpdateChain = {
                eq: vi.fn().mockReturnThis(),
            };
            mockUpdateChain.eq.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue(mockUpdateChain),
            });

            const result = await updateProjectAction('project-id', {
                title: 'Updated Title',
                strategy: 'SAFETY',
            });

            expect(result).toEqual({ success: true });
        });

        it('should validate input data on update', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            await expect(
                updateProjectAction('project-id', {
                    title: 'a'.repeat(101), // Too long
                    strategy: 'GROWTH',
                })
            ).rejects.toThrow();
        });
    });
});
