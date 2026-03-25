import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/api-response'
import { createFolderSchema } from '@/lib/validations'
import { getUserIdFromSession } from '@/lib/session'
import logger from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return fail('未登录', 401)

    const folders = await prisma.favoriteFolder.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        cards: { select: { cardId: true } },
      },
    })

    const result = folders.map(f => ({
      id: f.id,
      name: f.name,
      color: f.color,
      order: f.order,
      cardIds: f.cards.map(c => c.cardId),
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }))

    return ok(result)
  } catch (error: any) {
    logger.error('Error in /api/favorites GET', { error: error.message })
    return fail('获取收藏夹失败', 500)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return fail('未登录', 401)

    const body = await request.json()
    const validated = createFolderSchema.parse(body)

    const count = await prisma.favoriteFolder.count({ where: { userId } })
    const folder = await prisma.favoriteFolder.create({
      data: { userId, ...validated, order: count },
    })

    logger.info('Folder created', { folderId: folder.id, userId })
    return ok({
      ...folder,
      cardIds: [],
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
    }, 201)
  } catch (error: any) {
    logger.error('Error in /api/favorites POST', { error: error.message })
    if (error.name === 'ZodError') {
      return fail('输入数据格式错误', 400)
    }
    return fail('创建收藏夹失败', 500)
  }
}
