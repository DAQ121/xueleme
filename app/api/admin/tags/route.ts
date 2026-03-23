import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  try {
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.tag.count(),
    ]);
    return NextResponse.json({ list: tags, total, page, pageSize });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ message: '获取标签失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: '标签名称不能为空' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { name },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json({ message: '标签名称已存在' }, { status: 409 });
    }
    console.error('Failed to create tag:', error);
    return NextResponse.json({ message: '创建标签失败' }, { status: 500 });
  }
}
