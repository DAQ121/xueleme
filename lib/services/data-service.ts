/**
 * 数据服务层 - 统一数据获取逻辑
 */

import { cardsApi, categoriesApi, favoritesApi, settingsApi } from '@/lib/api'
import type { KnowledgeCard, FavoriteFolder, Category, UserSettings } from '@/lib/types'
import { getCache, setCache, delCache } from '@/lib/cache'
import logger from '@/lib/logger'

class DataService {
  private async withCache<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await getCache<T>(key)
    if (cached) return cached

    const data = await fetcher()
    await setCache(key, data, ttl)
    return data
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error('Max retries reached')
  }

  async getCards(params: { categoryId?: string; page?: number; pageSize?: number } = {}): Promise<KnowledgeCard[]> {
    try {
      const cacheKey = `cards:${JSON.stringify(params)}`
      return await this.withCache(cacheKey, async () => {
        const res = await this.withRetry(() => cardsApi.getList(params))
        return res.list
      })
    } catch (error) {
      logger.error('Failed to get cards', { error, params })
      throw error
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await this.withCache('categories', () => this.withRetry(() => categoriesApi.getAll()))
    } catch (error) {
      logger.error('Failed to get categories', { error })
      throw error
    }
  }

  async getFavorites(): Promise<FavoriteFolder[]> {
    try {
      return await this.withRetry(() => favoritesApi.getAll())
    } catch (error) {
      logger.error('Failed to get favorites', { error })
      throw error
    }
  }

  async getSettings(): Promise<UserSettings | null> {
    try {
      return await this.withRetry(() => settingsApi.get())
    } catch (error) {
      logger.error('Failed to get settings', { error })
      throw error
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      await this.withRetry(() => settingsApi.update(settings))
    } catch (error) {
      logger.error('Failed to update settings', { error, settings })
      throw error
    }
  }

  async invalidateCache(pattern: string): Promise<void> {
    await delCache(pattern)
  }
}

export const dataService = new DataService()
