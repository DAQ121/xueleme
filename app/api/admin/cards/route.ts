import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const status = searchParams.get('status') || undefined

  const where = status ? { status: status as any } : undefined

  const [list, total] = await Promise.all([
    prisma.cards.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      include: { categories: true },
    }),
    prisma.cards.count({ where }),
  ])

  const formattedList = list.map(card => ({
    ...card,
    category: card.categories,
    likesCount: card.likes_count,
    favoritesCount: card.favorites_count,
  }))

  return NextResponse.json({ code: 0, data: { list: formattedList, total } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, categoryId, tags, likesCount, favoritesCount } = body

    if (!content || !categoryId) {
      return NextResponse.json({ code: 400, message: '内容和分类不能为空' }, { status: 400 })
    }

    const card = await prisma.cards.create({
      data: {
        content,
        category_id: categoryId,
        tags: tags || [],
        likes_count: likesCount || 0,
        favorites_count: favoritesCount || 0,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ code: 0, data: card }, { status: 201 })
  } catch (error) {
    console.error('Failed to create card:', error)
    return NextResponse.json({ code: 500, message: '创建卡片失败' }, { status: 500 })
  }
}
