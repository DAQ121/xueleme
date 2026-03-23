import { NextResponse } from 'next/server';
import * as next_headers from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/api-response';
import { loginSchema } from '@/lib/validations';
import logger from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return apiError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash || '');
    if (!isPasswordValid) {
      return apiError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const cookieStore = await next_headers.cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    logger.info('Admin login successful', { userId: user.id, email: user.email });
    return apiSuccess({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', '输入数据格式错误', 400);
    }
    return apiError('INTERNAL_ERROR', '服务器内部错误', 500);
  }
}
