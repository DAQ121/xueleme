/**
 * 认证 API
 */
import { apiClient } from './client'

export interface User {
  id: string
  phone: string
  isSubscribed: boolean
  createdAt: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  // 发送验证码
  sendCode: (phone: string) =>
    apiClient.post<void>('/auth/send-code', { phone }),

  // 登录 / 注册
  login: (phone: string, code: string) =>
    apiClient.post<LoginResponse>('/auth/login', { phone, code }),

  // 退出登录
  logout: () =>
    apiClient.post<void>('/auth/logout'),
}
