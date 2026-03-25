import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const formatted = categories.map(c => ({
      id: String(c.id),
      name: c.name,
      order: c.order,
    }));

    return NextResponse.json({ code: 0, data: formatted });
  } catch (error) {
    console.error("Error in /api/categories GET:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
