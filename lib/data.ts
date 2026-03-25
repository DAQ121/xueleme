import { prisma } from './prisma'
import { MOCK_CARDS, MOCK_CATEGORIES } from './mock-data'
import { FOLDER_COLOR_PRESETS } from './constants'
import type { KnowledgeCard, FavoriteFolder } from './types'

const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true'

export async function getCards(categoryId?: string): Promise<KnowledgeCard[]> {
  if (USE_API) {
    const where: any = { status: 'PUBLISHED' }
    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    const cards = await prisma.card.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return cards.map(c => ({
      id: String(c.id),
      categoryId: String(c.categoryId),
      content: c.content,
      author: c.author ?? undefined,
      source: c.source ?? undefined,
      gradient: '',
      createdAt: c.createdAt.toISOString(),
    }))
  }

  let cards = MOCK_CARDS
  if (categoryId) cards = MOCK_CARDS.filter(c => c.categoryId === categoryId)
  return Promise.resolve(cards)
}
