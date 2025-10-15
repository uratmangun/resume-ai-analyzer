import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import auth0 from '@/lib/auth0';

export async function middleware(request: NextRequest) {
  // Only use auth0.middleware for /auth/* routes (login, logout, callback)
  if (request.nextUrl.pathname.startsWith('/auth')) {
    try {
      return await auth0.middleware(request);
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Clear bad cookies and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('appSession');
      return response;
    }
  }

  // For all other routes, check if protected and verify session without calling auth0.middleware
  const protectedPaths = ['/api/resumes', '/api/api-keys', '/resumes'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtected) {
    try {
      const session = await auth0.getSession(request);
      if (!session) {
        // Clear any bad cookies and redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('appSession');
        return response;
      }
    } catch (error) {
      // Session cookie is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('appSession');
      return response;
    }
  }

  // For public routes, just continue without checking session
  // This avoids JWE errors on every request
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
