/**
 * 反馈 API
 */
import { apiClient } from './client'

export const feedbackApi = {
  // 提交意见反馈
  submit: (content: string) =>
    apiClient.post<void>('/feedback', { content }),
}
