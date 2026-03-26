import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')

  const logs = await prisma.generation_logs.findMany({
    where: categoryId ? { category_id: parseInt(categoryId, 10) } : undefined,
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
      categories: { select: { name: true } },
      model_configs: { select: { name: true } },
    },
  })

  return NextResponse.json({ code: 0, data: { list: logs } })
}
