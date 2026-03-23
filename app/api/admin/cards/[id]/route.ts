import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await prisma.card.findUnique({ where: { id } })
  if (!card) return NextResponse.json({ message: '卡片不存在' }, { status: 404 })
  return NextResponse.json(card)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const card = await prisma.card.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(card)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.card.delete({ where: { id } })
  return NextResponse.json({ message: '删除成功' })
}
