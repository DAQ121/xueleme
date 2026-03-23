/**
 * 统一的 localStorage 封装
 * 提供类型安全和错误处理
 */

const STORAGE_PREFIX = 'xueleme_'

export const STORAGE_KEYS = {
  FAVORITES: `${STORAGE_PREFIX}favorites`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
} as const

class StorageService {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error)
      return defaultValue
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error)
      return false
    }
  }

  remove(key: string): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error)
      return false
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }
}

export const storage = new StorageService()
