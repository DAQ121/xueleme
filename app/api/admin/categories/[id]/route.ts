import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a category
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: body,
    });
    return NextResponse.json(category);
  } catch (error) {
    const { id } = await params; // For logging
    console.error(`Failed to update category ${id}:`, error);
    return NextResponse.json({ message: '更新分类失败' }, { status: 500 });
  }
}

// Delete a category
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Note: This will cascade delete related cards if your schema is set up for it.
    // Or you might want to handle related cards first (e.g., re-assign them).
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { id } = await params; // For logging
    console.error(`Failed to delete category ${id}:`, error);
    return NextResponse.json({ message: '删除分类失败' }, { status: 500 });
  }
}
