import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 添加卡片到收藏夹
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: folderId } = await params
  const { cardId } = await request.json()

  // 检查是否已收藏
  const existing = await prisma.favoriteCard.findUnique({
    where: { folderId_cardId: { folderId, cardId } },
  })
  if (existing) return NextResponse.json({ message: '已收藏' })

  await prisma.favoriteCard.create({ data: { folderId, cardId } })
  return NextResponse.json({ message: '收藏成功' })
}
