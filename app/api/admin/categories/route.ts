import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { cards: true } },
    },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const { name, order } = await request.json()
  const category = await prisma.category.create({
    data: { name, order: order ?? 0 },
  })
  return NextResponse.json(category, { status: 201 })
}
