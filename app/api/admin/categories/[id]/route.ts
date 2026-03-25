import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, code, template, isScheduled, cronExpression, order, isActive, tags } = body
    const category = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { name, code, template, isScheduled, cronExpression, order, isActive, tags },
    })
    return NextResponse.json({ code: 0, data: category })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ code: 500, message: '更新分类失败' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.category.delete({ where: { id: parseInt(id, 10) } })
    return NextResponse.json({ code: 0, data: null }, { status: 200 })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ code: 500, message: '删除分类失败' }, { status: 500 })
  }
}
