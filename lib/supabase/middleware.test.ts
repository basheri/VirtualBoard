import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { updateSession } from './middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock supabase/ssr
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
    const actual = vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            next: vi.fn(),
            redirect: vi.fn(),
        },
        NextRequest: vi.fn(),
    };
});

import { createServerClient } from '@supabase/ssr';

describe('Middleware Auth Logic', () => {
    let mockRequest: any;
    let mockSupabase: any;
    let mockResponse: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock response
        mockResponse = {
            cookies: {
                set: vi.fn(),
            },
        };
        (NextResponse.next as Mock).mockReturnValue(mockResponse);
        (NextResponse.redirect as Mock).mockImplementation((url) => ({
            type: 'redirect',
            url: url.toString(),
            cookies: { set: vi.fn() },
        }));

        // Setup mock supabase
        mockSupabase = {
            auth: {
                getUser: vi.fn(),
            },
        };
        (createServerClient as Mock).mockReturnValue(mockSupabase);

        // Setup default mock request
        mockRequest = {
            nextUrl: new URL('http://localhost:3000/'),
            cookies: {
                getAll: vi.fn().mockReturnValue([]),
                set: vi.fn(),
            },
            url: 'http://localhost:3000/',
        };
    });

    it('should allow public routes without user', async () => {
        mockRequest.nextUrl.pathname = '/';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        const response = await updateSession(mockRequest);

        expect(response).toBe(mockResponse);
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(createServerClient).toHaveBeenCalled();
    });

    it('should redirect unauthenticated user from protected route /dashboard', async () => {
        mockRequest.nextUrl.pathname = '/dashboard';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = (NextResponse.redirect as Mock).mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/login');
        expect(redirectCall.searchParams.get('redirectTo')).toBe('/dashboard');
    });

    it('should redirect unauthenticated user from protected route /projects', async () => {
        mockRequest.nextUrl.pathname = '/projects/123';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalled();
        expect(NextResponse.redirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/login',
            })
        );
    });

    it('should allow authenticated user to access protected route', async () => {
        mockRequest.nextUrl.pathname = '/dashboard';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

        const response = await updateSession(mockRequest);

        expect(response).toBe(mockResponse);
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect authenticated user from login page to dashboard', async () => {
        mockRequest.nextUrl.pathname = '/login';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = (NextResponse.redirect as Mock).mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/dashboard/projects');
    });

    it('should redirect authenticated user from signup page to dashboard', async () => {
        mockRequest.nextUrl.pathname = '/signup';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = (NextResponse.redirect as Mock).mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/dashboard/projects');
    });

    it('should allow unauthenticated user to access login page', async () => {
        mockRequest.nextUrl.pathname = '/login';
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        const response = await updateSession(mockRequest);

        expect(response).toBe(mockResponse);
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
});
