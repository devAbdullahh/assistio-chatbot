import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session.js';

const AUTH_PAGES = ['/login', '/signup'];
const PUBLIC_PAGES = ['/', ...AUTH_PAGES];

const TOKEN_CONSUMING = [
  { method: 'POST', prefix: '/api/chat' },
  { method: 'POST', prefix: '/api/documents/upload' },
  { method: 'POST', prefix: '/api/documents/text' },
];

function isTokenConsumingRequest(request) {
  const { pathname } = request.nextUrl;
  return TOKEN_CONSUMING.some(
    (route) =>
      request.method === route.method && pathname.startsWith(route.prefix)
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/icon' ||
    pathname.startsWith('/apple-icon')
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublicPage = PUBLIC_PAGES.includes(pathname);
  const isAuthApi = pathname.startsWith('/api/auth');

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isPublicPage) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isTokenConsumingRequest(request)) {
    try {
      const checkUrl = new URL('/api/auth/tokens', request.url);
      checkUrl.searchParams.set('min', '1');

      const tokenRes = await fetch(checkUrl.toString(), {
        headers: { cookie: request.headers.get('cookie') || '' },
      });

      if (tokenRes.ok) {
        const data = await tokenRes.json();
        if (!data.canSpend) {
          return NextResponse.json(
            {
              error: data.message,
              code: 'INSUFFICIENT_TOKENS',
              tokens: {
                balance: data.balance,
                used: data.used,
                granted: data.granted,
                exhausted: data.exhausted,
              },
            },
            { status: 402 }
          );
        }
      }
    } catch {
      // Allow route handlers to enforce if the check request fails
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
