import { prisma } from './prisma'
import { MOCK_CARDS, MOCK_CATEGORIES } from './mock-data'
import { FOLDER_COLOR_PRESETS } from './constants'
import type { KnowledgeCard, FavoriteFolder } from './types'

const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true'

export async function getCards(categoryId?: string): Promise<KnowledgeCard[]> {
  if (USE_API) {
    const cards = await prisma.card.findMany({
      where: {
        status: 'PUBLISHED',
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return cards.map(c => ({
      id: c.id,
      categoryId: c.categoryId,
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

export async function getFavorites(): Promise<FavoriteFolder[]> {
  const initialFavorites: FavoriteFolder[] = MOCK_CATEGORIES.map((category, index) => ({
    ...category,
    color: FOLDER_COLOR_PRESETS[index % FOLDER_COLOR_PRESETS.length],
    cardIds: MOCK_CARDS.filter(c => c.categoryId === category.id).map(c => c.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
  return Promise.resolve(initialFavorites)
}
