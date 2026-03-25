import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 添加卡片到收藏夹
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: folderId } = await params
  const { cardId } = await request.json()

  const existing = await prisma.favorite_cards.findUnique({
    where: { folderId_cardId: { folderId, cardId } },
  })
  if (existing) return NextResponse.json({ code: 0, data: { message: '已收藏' } })

  await prisma.favorite_cards.create({ data: { folderId, cardId } })
  return NextResponse.json({ code: 0, data: { message: '收藏成功' } })
}
