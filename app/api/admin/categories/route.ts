import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [list, total] = await Promise.all([
    prisma.categories.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { cards: true } } },
    }),
    prisma.categories.count(),
  ])

  // 转换字段名为驼峰
  const formattedList = list.map(cat => ({
    ...cat,
    isScheduled: cat.is_scheduled,
    cronExpression: cat.cron_expression,
    isActive: cat.is_active,
    modelConfigId: cat.model_config_id,
  }))

  return NextResponse.json({ code: 0, data: { list: formattedList, total } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, code, template, isScheduled, cronExpression, order, tags } = body

    if (!name || !code) {
      return NextResponse.json({ code: 400, message: '分类名称和编码不能为空' }, { status: 400 })
    }

    const category = await prisma.categories.create({
      data: { name, code, template, isScheduled, cronExpression, order: order ?? 0, tags: tags ?? [] },
    })

    return NextResponse.json({ code: 0, data: category }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json({ code: 409, message: '分类编码已存在' }, { status: 409 })
    }
    console.error('Failed to create category:', error)
    return NextResponse.json({ code: 500, message: '创建分类失败' }, { status: 500 })
  }
}
