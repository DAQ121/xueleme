'use client'

/**
 * API 客户端 - 统一处理请求、认证、错误
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('xueleme_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // 如果 HTTP 状态码不是 2xx，则抛出错误
    const errorText = await res.text()
    throw new Error(errorText || `Request failed with status ${res.status}`)
  }

  if (res.headers.get('Content-Length') === '0' || res.status === 204) {
    // 如果响应体为空，则返回 null 或 undefined
    return null as T
  }

  const json: ApiResponse<T> = await res.json()

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '请求失败')
  }

  return json.data
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { ApiError }
