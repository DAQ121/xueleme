import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const user = await prisma.user.update({
    where: { id },
    data: body,
    select: {
      id: true,
      phone: true,
      email: true,
      isSubscribed: true,
      role: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ code: 0, data: user })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ code: 0, data: null })
}
