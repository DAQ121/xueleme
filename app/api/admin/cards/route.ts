import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(status ? { status: status as any } : {}),
  }

  const [list, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    }),
    prisma.card.count({ where }),
  ])

  return NextResponse.json({ list, total, page, pageSize, hasMore: page * pageSize < total })
}

export async function POST(request: Request) {
  const body = await request.json()
  const card = await prisma.card.create({
    data: {
      categoryId: body.categoryId,
      content: body.content,
      author: body.author || null,
      source: body.source || null,
      status: body.status || 'PUBLISHED',
    },
  })
  return NextResponse.json(card, { status: 201 })
}
