import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (!rateLimit(request)) {
      console.warn('Rate limit exceeded', { ip: request.headers.get('x-forwarded-for'), pathname });
      return NextResponse.json({ success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }, { status: 429 });
    }
  }

  // JWT verification for admin routes
  const token = request.cookies.get('access_token')?.value;

  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin/auth/login')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', String(payload.userId));
    response.headers.set('x-user-role', payload.role);
    return response;
  }

  return NextResponse.next();
}
