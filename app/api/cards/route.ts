import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api-response'
import { getCache, setCache } from '@/lib/cache'
import { toInt } from '@/lib/id-utils'
import logger from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const cacheKey = `cards:${categoryId || 'all'}:${page}:${pageSize}`
    const cached = await getCache(cacheKey)
    if (cached) return apiSuccess(cached)

    const where = {
      status: 'PUBLISHED' as const,
      ...(categoryId ? { categoryId: toInt(categoryId) } : {}),
    }

    const [list, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          categoryId: true,
          tags: true,
          createdAt: true,
        },
      }),
      prisma.card.count({ where }),
    ])

    const result = { list, total, page, pageSize, hasMore: page * pageSize < total }
    await setCache(cacheKey, result, 300)
    return apiSuccess(result)
  } catch (error: any) {
    logger.error('Error in /api/cards GET', { error: error.message })
    return apiError('FETCH_FAILED', '获取卡片失败', 500)
  }
}
