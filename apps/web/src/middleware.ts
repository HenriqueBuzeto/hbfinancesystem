import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth0 } from '@/lib/auth0';

export async function middleware(request: NextRequest) {
  const auth0 = getAuth0();
  if (!auth0) return NextResponse.next();
  try {
    const response = await auth0.middleware(request);
    if (response) return response;
  } catch (e) {
    console.error('[middleware] Auth0 error:', e);
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/auth0/:path*',
    '/app/:path*',
  ],
};
