/**
 * 卡片 API
 */
import { apiClient } from './client'
import type { KnowledgeCard } from '@/lib/types'

export interface CardsResponse {
  list: KnowledgeCard[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface GetCardsParams {
  categoryId?: string
  page?: number
  pageSize?: number
}

export const cardsApi = {
  // 获取卡片列表
  getList: (params: GetCardsParams = {}) => {
    const query = new URLSearchParams()
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))
    const qs = query.toString()
    return apiClient.get<CardsResponse>(`/cards${qs ? `?${qs}` : ''}`)
  },

  // 获取卡片详情
  getById: (id: string) =>
    apiClient.get<KnowledgeCard>(`/cards/${id}`),
}
