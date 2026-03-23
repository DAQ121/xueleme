import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新收藏夹
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const folder = await prisma.favoriteFolder.update({
    where: { id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.color ? { color: body.color } : {}),
    },
  })

  return NextResponse.json({
    ...folder,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  })
}

// 删除收藏夹
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.favoriteFolder.delete({ where: { id } })
  return NextResponse.json({ message: '删除成功' })
}
