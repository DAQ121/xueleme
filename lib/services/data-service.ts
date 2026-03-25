/**
 * 数据服务层 - 统一数据获取逻辑
 * USE_API=true 时调用真实后端，false 时使用 mock 数据
 */

import { MOCK_CARDS, MOCK_CATEGORIES } from '@/lib/mock-data'
import { FOLDER_COLOR_PRESETS } from '@/lib/constants'
import { cardsApi, categoriesApi, favoritesApi, settingsApi, userApi } from '@/lib/api'
import type { KnowledgeCard, FavoriteFolder, Category, UserSettings } from '@/lib/types'

const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true'

class DataService {
  async getCards(params: { categoryId?: string; page?: number; pageSize?: number } = {}): Promise<KnowledgeCard[]> {
    if (USE_API) {
      const res = await cardsApi.getList(params)
      return res.list
    }
    if (params.categoryId) {
      return MOCK_CARDS.filter(card => card.categoryId === params.categoryId)
    }
    return MOCK_CARDS
  }

  async getCategories(): Promise<Category[]> {
    if (USE_API) {
      return categoriesApi.getAll()
    }
    return MOCK_CATEGORIES
  }

  async getFavorites(): Promise<FavoriteFolder[]> {
    if (USE_API) {
      return favoritesApi.getAll()
    }
    return this.getInitialFavorites()
  }

  async getSettings(): Promise<UserSettings | null> {
    if (USE_API) {
      return settingsApi.get()
    }
    return null
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    if (USE_API) {
      await settingsApi.update(settings)
    }
    // 非 API 模式下由 storage 层处理
  }

  async getMe() {
    if (USE_API) {
      return userApi.getMe()
    }
    return null // Return null in mock mode or if not applicable
  }

  getInitialFavorites(): FavoriteFolder[] {
    return MOCK_CATEGORIES.map((category, index) => ({
      ...category,
      color: FOLDER_COLOR_PRESETS[index % FOLDER_COLOR_PRESETS.length],
      cardIds: MOCK_CARDS.filter(c => c.categoryId === category.id).map(c => c.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  }
}

export const dataService = new DataService()
