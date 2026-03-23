import { NextResponse } from 'next/server';
import * as next_headers from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { phone, code } = await request.json();

  // In a real application, you would verify the code here.
  // For now, we'll just find or create the user.

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phone },
    });
  }

  const session = {
    userId: user.id,
  };

  next_headers.cookies().set('user-session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return NextResponse.json({ message: '登录成功' });
}
