import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { content, userId } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ code: 422, message: '反馈内容不能为空' }, { status: 422 })
  }

  const feedback = await prisma.feedback.create({
    data: {
      content: content.trim(),
      ...(userId ? { userId } : {}),
    },
  })

  return NextResponse.json({ code: 0, data: { message: '感谢您的反馈', id: feedback.id } }, { status: 201 })
}
