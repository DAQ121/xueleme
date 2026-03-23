import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ message: '状态不能为空' }, { status: 400 });
    }

    const feedback = await prisma.feedback.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    const { id } = await params; // For logging
    console.error(`Failed to update feedback ${id}:`, error);
    return NextResponse.json({ message: '更新反馈失败' }, { status: 500 });
  }
}
