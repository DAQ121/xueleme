import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''

  const where = search ? {
    OR: [
      { phone: { contains: search } },
      { email: { contains: search } },
    ]
  } : {}

  const [list, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        phone: true,
        email: true,
        is_subscribed: true,
        role: true,
        created_at: true,
        _count: { select: { favorite_folders: true } },
      },
    }),
    prisma.users.count({ where }),
  ])

  return NextResponse.json({ code: 0, data: { list, total, page, pageSize, hasMore: page * pageSize < total } })
}
