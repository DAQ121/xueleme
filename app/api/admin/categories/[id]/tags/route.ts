import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/admin/categories/[id]/tags
// body: { tag: string }
// 从分类标签池删除该标签，并清理该分类下所有卡片中的该标签
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const categoryId = parseInt(id, 10)
    const { tag } = await request.json()

    if (!tag) {
      return NextResponse.json({ message: '标签不能为空' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ message: '分类不存在' }, { status: 404 })
    }

    const currentTags = (category.tags as string[]) ?? []
    const newTags = currentTags.filter(t => t !== tag)

    // 找出该分类下含此标签的所有卡片
    const cards = await prisma.card.findMany({
      where: { categoryId },
      select: { id: true, tags: true },
    })

    // 并行：更新分类标签池 + 清理卡片标签
    await Promise.all([
      prisma.category.update({
        where: { id: categoryId },
        data: { tags: newTags },
      }),
      ...cards
        .filter(c => (c.tags as string[]).includes(tag))
        .map(c =>
          prisma.card.update({
            where: { id: c.id },
            data: { tags: (c.tags as string[]).filter(t => t !== tag) },
          })
        ),
    ])

    return NextResponse.json({ tags: newTags })
  } catch (error) {
    console.error('Failed to delete tag from category:', error)
    return NextResponse.json({ message: '删除标签失败' }, { status: 500 })
  }
}
