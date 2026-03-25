import * as next_headers from 'next/headers';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { ok, fail } from '@/lib/api-response';

export async function POST() {
  try {
    const cookieStore = await next_headers.cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return fail('Refresh token not found', 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return fail('Invalid refresh token', 401);
    }

    const accessToken = generateAccessToken(payload);
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    return ok({ message: 'Token refreshed' });
  } catch {
    return fail('服务器内部错误', 500);
  }
}
