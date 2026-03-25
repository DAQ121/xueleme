import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')

  const logs = await prisma.generationLog.findMany({
    where: categoryId ? { categoryId: parseInt(categoryId, 10) } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      category: { select: { name: true } },
      modelConfig: { select: { name: true } },
    },
  })

  return NextResponse.json({ code: 0, data: { list: logs } })
}
