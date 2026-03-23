/**
 * 收藏夹 API
 */
import { apiClient } from './client'
import type { FavoriteFolder } from '@/lib/types'

export const favoritesApi = {
  // 获取收藏夹列表
  getAll: () =>
    apiClient.get<FavoriteFolder[]>('/favorites'),

  // 创建收藏夹
  create: (name: string, color: string) =>
    apiClient.post<FavoriteFolder>('/favorites', { name, color }),

  // 更新收藏夹
  update: (id: string, updates: Partial<Pick<FavoriteFolder, 'name' | 'color'>>) =>
    apiClient.patch<FavoriteFolder>(`/favorites/${id}`, updates),

  // 删除收藏夹
  delete: (id: string) =>
    apiClient.delete<void>(`/favorites/${id}`),

  // 添加卡片到收藏夹
  addCard: (folderId: string, cardId: string) =>
    apiClient.post<void>(`/favorites/${folderId}/cards`, { cardId }),

  // 从收藏夹移除卡片
  removeCard: (folderId: string, cardId: string) =>
    apiClient.delete<void>(`/favorites/${folderId}/cards/${cardId}`),

  // 移动卡片到其他收藏夹
  moveCard: (folderId: string, cardId: string, targetFolderId: string) =>
    apiClient.post<void>(`/favorites/${folderId}/cards/${cardId}/move`, { targetFolderId }),
}
