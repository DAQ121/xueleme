import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      // Return consistent API format
      return NextResponse.json({ code: 0, data: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, role: true, isSubscribed: true },
    });

    return NextResponse.json({ code: 0, data: user });
  } catch (error) {
    console.error('Failed to get current user:', error);
    return NextResponse.json({ code: 500, message: '获取用户信息失败' }, { status: 500 });
  }
}
