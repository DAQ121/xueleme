import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取用户收藏夹列表（暂时不做认证，后续接入 token）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ message: '缺少 userId' }, { status: 400 })
  }

  const folders = await prisma.favoriteFolder.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
    include: {
      cards: { select: { cardId: true } },
    },
  })

  // 转换为前端格式
  const result = folders.map(f => ({
    id: f.id,
    name: f.name,
    color: f.color,
    order: f.order,
    cardIds: f.cards.map(c => c.cardId),
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const { userId, name, color } = await request.json()

  if (!userId) return NextResponse.json({ message: '缺少 userId' }, { status: 400 })

  const count = await prisma.favoriteFolder.count({ where: { userId } })

  const folder = await prisma.favoriteFolder.create({
    data: { userId, name, color, order: count },
  })

  return NextResponse.json({
    ...folder,
    cardIds: [],
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  }, { status: 201 })
}
