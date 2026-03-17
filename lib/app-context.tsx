'use client'

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react'
import { Toaster } from '@/lib/react-hot-toast'
import { useFavorites } from '@/hooks/use-favorites'
import { MOCK_CATEGORIES, MOCK_CARDS } from '@/lib/mock-data'
import type { Category, KnowledgeCard, UserSettings } from './types'

// 导出 AppContext 返回的完整类型
export type AppContextType = ReturnType<typeof useFavorites> & {
  categories: Category[];
  cards: KnowledgeCard[];
  settings: UserSettings;
  updateCategoryOrder: (newOrder: string[]) => void;
  isFavoriting: boolean;
  triggerFavoriteAnimation: () => void;
  getCardsByCategory: (categoryId: string) => KnowledgeCard[];
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEYS = {
  SETTINGS: 'xueleme-settings',
}

const defaultSettings: UserSettings = {
  selectedCategories: MOCK_CATEGORIES.slice(0, 5).map(c => c.id),
  categoryOrder: MOCK_CATEGORIES.map(c => c.id),
  theme: 'system',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories] = useState<Category[]>(MOCK_CATEGORIES)
  const [cards] = useState<KnowledgeCard[]>(MOCK_CARDS)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isFavoriting, setIsFavoriting] = useState(false)

  const favoritesData = useFavorites()

  // 此处只保留与 settings 相关的 localStorage 逻辑
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }, [settings])

  const updateCategoryOrder = (newOrder: string[]) => {
    setSettings(prev => ({ ...prev, categoryOrder: newOrder }))
  }

  const triggerFavoriteAnimation = useCallback(() => {
    setIsFavoriting(true)
    setTimeout(() => setIsFavoriting(false), 500)
  }, [])

  const getCardsByCategory = useCallback((categoryId: string) => {
    return cards.filter(card => card.categoryId === categoryId)
  }, [cards])

  return (
    <AppContext.Provider value={{
      ...favoritesData,
      categories,
      cards,
      settings,
      updateCategoryOrder,
      isFavoriting,
      triggerFavoriteAnimation,
      getCardsByCategory,
    }}>
      {children}
      <Toaster />
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
