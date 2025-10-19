import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import auth0 from '@/lib/auth0';

export async function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "*");
    return response;
  }

  // Only use auth0.middleware for /api/auth/* routes (login, logout, callback)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    try {
      const authResponse = await auth0.middleware(request);
      authResponse.headers.set("Access-Control-Allow-Origin", "*");
      authResponse.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      authResponse.headers.set("Access-Control-Allow-Headers", "*");
      return authResponse;
    } catch (error) {
      console.error('[Middleware] Auth middleware error:', error);
      // Clear bad cookies and redirect to login
      const response = NextResponse.redirect(new URL('/api/auth/login', request.url));
      response.cookies.delete('appSession');
      response.headers.set("Access-Control-Allow-Origin", "*");
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
        const response = NextResponse.redirect(new URL('/api/auth/login', request.url));
        response.cookies.delete('appSession');
        response.headers.set("Access-Control-Allow-Origin", "*");
        return response;
      }
    } catch (error) {
      // Session cookie is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/api/auth/login', request.url));
      response.cookies.delete('appSession');
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }
  }

  // For public routes, just continue without checking session
  // This avoids JWE errors on every request
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "*");
  return response;
}

export const config = {
  matcher: "/:path*",
};
