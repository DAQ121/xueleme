import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api-response'
import { updateCardSchema } from '@/lib/validations'
import { clearCachePattern } from '@/lib/cache'
import { toInt } from '@/lib/id-utils'
import logger from '@/lib/logger'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const card = await prisma.card.findUnique({
      where: { id: toInt(id) },
      select: {
        id: true,
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
    if (!card) return apiError('NOT_FOUND', '卡片不存在', 404)
    return apiSuccess(card)
  } catch (error: any) {
    logger.error('Failed to get card', { error: error.message })
    return apiError('FETCH_FAILED', '获取卡片失败', 500)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateCardSchema.parse(body)

    const card = await prisma.card.update({
      where: { id: toInt(id) },
      data: validated,
    })

    await clearCachePattern('admin:cards:*')
    await clearCachePattern('cards:*')
    logger.info('Card updated', { cardId: card.id })
    return apiSuccess(card)
  } catch (error: any) {
    logger.error('Failed to update card', { error: error.message })
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', '输入数据格式错误', 400)
    }
    return apiError('UPDATE_FAILED', '更新卡片失败', 500)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.card.delete({ where: { id: toInt(id) } })
    await clearCachePattern('admin:cards:*')
    await clearCachePattern('cards:*')
    logger.info('Card deleted', { cardId: id })
    return apiSuccess({ message: '删除成功' })
  } catch (error: any) {
    logger.error('Failed to delete card', { error: error.message })
    return apiError('DELETE_FAILED', '删除卡片失败', 500)
  }
}
