import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where = {
    status: 'PUBLISHED' as const,
    ...(categoryId ? { categoryId } : {}),
  }

  const [list, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.card.count({ where }),
  ])

  return NextResponse.json({ list, total, page, pageSize, hasMore: page * pageSize < total })
}
