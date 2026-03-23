/**
 * 用户设置 API
 */
import { apiClient } from './client'
import type { UserSettings } from '@/lib/types'

export const settingsApi = {
  // 获取用户设置
  get: () =>
    apiClient.get<UserSettings>('/user/settings'),

  // 更新用户设置
  update: (settings: Partial<UserSettings>) =>
    apiClient.patch<UserSettings>('/user/settings', settings),
}
