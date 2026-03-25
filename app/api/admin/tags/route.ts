import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ code: 0, data: tags })
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return NextResponse.json({ code: 500, message: '获取标签失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ code: 400, message: '标签名称不能为空' }, { status: 400 })
    }

    const tag = await prisma.tag.create({ data: { name } })
    return NextResponse.json({ code: 0, data: tag }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json({ code: 409, message: '标签名称已存在' }, { status: 409 })
    }
    console.error('Failed to create tag:', error)
    return NextResponse.json({ code: 500, message: '创建标签失败' }, { status: 500 })
  }
}
