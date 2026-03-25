import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const status = searchParams.get('status') || undefined

  const where = status ? { status: status as any } : undefined

  const [list, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.card.count({ where }),
  ])

  return NextResponse.json({ code: 0, data: { list, total } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, categoryId, tags, likesCount, favoritesCount } = body

    if (!content || !categoryId) {
      return NextResponse.json({ code: 400, message: '内容和分类不能为空' }, { status: 400 })
    }

    const card = await prisma.card.create({
      data: {
        content,
        categoryId,
        tags: tags || [],
        likesCount: likesCount || 0,
        favoritesCount: favoritesCount || 0,
      },
    })

    return NextResponse.json({ code: 0, data: card }, { status: 201 })
  } catch (error) {
    console.error('Failed to create card:', error)
    return NextResponse.json({ code: 500, message: '创建卡片失败' }, { status: 500 })
  }
}
