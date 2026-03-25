import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search') || ''

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(search ? { content: { contains: search } } : {}),
  }

  const [list, total] = await Promise.all([
    prisma.feedbacks.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { users: { select: { phone: true, email: true } } },
    }),
    prisma.feedbacks.count({ where }),
  ])

  return NextResponse.json({ code: 0, data: { list, total } })
}
