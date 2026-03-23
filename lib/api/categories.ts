/**
 * 分类 API
 */
import { apiClient } from './client'
import type { Category } from '@/lib/types'

export const categoriesApi = {
  // 获取所有分类
  getAll: () =>
    apiClient.get<Category[]>('/categories'),
}
