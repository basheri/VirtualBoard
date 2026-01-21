import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates the user's session and enforces route protection.
 * 
 * Protected routes: /dashboard, /projects, /meetings
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users away from auth pages to /dashboard/projects
 * 
 * @param request - The incoming Next.js request
 * @returns The response with updated session cookies
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - require authentication
  const protectedRoutes = ['/dashboard', '/projects', '/meetings'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing auth pages while authenticated
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    const redirectUrl = new URL('/dashboard/projects', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
