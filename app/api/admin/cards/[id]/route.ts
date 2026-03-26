import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/api-response'
import { updateCardSchema } from '@/lib/validations'
import { clearCachePattern } from '@/lib/cache'
import { toInt } from '@/lib/id-utils'
import logger from '@/lib/logger'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const card = await prisma.cards.findUnique({
      where: { id: toInt(id) },
      select: {
        id: true,
        title: true,
        content: true,
        categoryId: true,
        status: true,
        tags: true,
        author: true,
        source: true,
        likesCount: true,
        favoritesCount: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    if (!card) return fail('卡片不存在', 404)
    return ok(card)
  } catch (error: any) {
    logger.error('Failed to get card', { error: error.message })
    return fail('获取卡片失败', 500)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateCardSchema.parse(body)

    const card = await prisma.cards.update({
      where: { id: toInt(id) },
      data: validated,
    })

    await clearCachePattern('admin:cards:*')
    await clearCachePattern('cards:*')
    logger.info('Card updated', { cardId: card.id })
    return ok(card)
  } catch (error: any) {
    const { id } = await params
    logger.error('Failed to update card', { cardId: id, error: error.message })
    if (error.name === 'ZodError') {
      return fail('输入数据格式错误', 400)
    }
    return fail('更新卡片失败', 500)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.cards.delete({ where: { id: toInt(id) } })
    await clearCachePattern('admin:cards:*')
    await clearCachePattern('cards:*')
    logger.info('Card deleted', { cardId: id })
    return ok({ message: '删除成功' })
  } catch (error: any) {
    const { id } = await params
    logger.error('Failed to delete card', { cardId: id, error: error.message })
    return fail('删除卡片失败', 500)
  }
}
