import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a tag
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: '标签名称不能为空' }, { status: 400 });
    }
    const tag = await prisma.tag.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'P2002') {
        return NextResponse.json({ message: '标签名称已存在' }, { status: 409 });
    }
    const { id } = await params; // For logging
    console.error(`Failed to update tag ${id}:`, error);
    return NextResponse.json({ message: '更新标签失败' }, { status: 500 });
  }
}

// Delete a tag
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.tag.delete({
      where: { id: parseInt(id, 10) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { id } = await params; // For logging
    console.error(`Failed to delete tag ${id}:`, error);
    return NextResponse.json({ message: '删除标签失败' }, { status: 500 });
  }
}
