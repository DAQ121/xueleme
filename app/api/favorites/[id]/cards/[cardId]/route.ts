import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 从收藏夹移除卡片
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id: folderId, cardId } = await params
  await prisma.favorite_cards.delete({
    where: { folderId_cardId: { folderId, cardId } },
  })
  return NextResponse.json({ code: 0, data: null })
}

// 移动卡片到其他收藏夹
export async function POST(request: Request, { params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id: folderId, cardId } = await params
  const { targetFolderId } = await request.json()

  await prisma.$transaction([
    prisma.favorite_cards.delete({ where: { folderId_cardId: { folderId, cardId } } }),
    prisma.favorite_cards.create({ data: { folderId: targetFolderId, cardId } }),
  ])

  return NextResponse.json({ code: 0, data: null })
}
