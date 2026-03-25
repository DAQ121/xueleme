/**
 * 卡片 API
 */
import { apiClient } from './client'
import type { KnowledgeCard } from '@/lib/types'

export interface CardsResponse {
  list: KnowledgeCard[]
  hasMore: boolean
}

export interface GetCardsParams {
  categoryId?: string
  visitorId?: string
  seed?: number
}

export const cardsApi = {
  // 获取卡片列表（曝光过的自动排除）
  getList: (params: GetCardsParams = {}) => {
    const query = new URLSearchParams()
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.visitorId) query.set('visitorId', params.visitorId)
    if (params.seed !== undefined) query.set('seed', String(params.seed))
    const qs = query.toString()
    return apiClient.get<CardsResponse>(`/cards${qs ? `?${qs}` : ''}`)
  },

  // 批量上报曝光（异步，不阻塞 UI）
  reportImpressions: (visitorId: string, cardIds: string[]) =>
    apiClient.post<void>('/cards/impressions', { visitorId, cardIds: cardIds.map(Number) }),

  // 获取卡片详情
  getById: (id: string) =>
    apiClient.get<KnowledgeCard>(`/cards/${id}`),
}
