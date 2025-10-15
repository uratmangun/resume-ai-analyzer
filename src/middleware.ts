import { Auth0Client } from '@auth0/nextjs-auth0/server';

const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE || 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
});

import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next|\\.well-known|mcp).*)',
    '/',
  ],
};
