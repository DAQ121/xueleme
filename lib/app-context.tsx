'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Toaster } from '@/lib/react-hot-toast';
import type { Category, KnowledgeCard, FavoriteFolder, UserSettings } from './types';
import { MOCK_CATEGORIES, MOCK_CARDS, DEFAULT_FAVORITE_FOLDER } from './mock-data';
import { getFavorites } from './data';

interface AppContextType {
  // 数据
  categories: Category[]
  cards: KnowledgeCard[]
  favorites: FavoriteFolder[]
  settings: UserSettings
  
  // 分类操作
  updateCategoryOrder: (newOrder: string[]) => void
  toggleCategory: (categoryId: string) => void
  setSelectedCategories: (categoryIds: string[]) => void
  
  // 收藏操作
  addToFavorite: (cardId: string, folderId: string) => void
  removeFromFavorite: (cardId: string, folderId: string) => void
  createFolder: (name: string, color: string) => FavoriteFolder
  updateFolder: (folderId: string, updates: Partial<FavoriteFolder>) => void
  deleteFolder: (folderId: string) => void
  isCardFavorited: (cardId: string) => boolean
  getFolderForCard: (cardId: string) => FavoriteFolder | undefined
  
  // 获取当前分类的卡片
  getCardsByCategory: (categoryId: string) => KnowledgeCard[]
  // 动画相关
  isFavoriting: boolean
  triggerFavoriteAnimation: () => void
  isHydrated: boolean
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  SETTINGS: 'xueleme-settings',
  FAVORITES: 'xueleme-favorites',
}

const defaultSettings: UserSettings = {
  selectedCategories: MOCK_CATEGORIES.slice(0, 5).map(c => c.id),
  categoryOrder: MOCK_CATEGORIES.map(c => c.id),
  theme: 'system',
}



export function AppProvider({ children }: { children: ReactNode }) {
  const [categories] = useState<Category[]>(MOCK_CATEGORIES)
  const [cards] = useState<KnowledgeCard[]>(MOCK_CARDS)
  const [favorites, setFavorites] = useState<FavoriteFolder[]>([DEFAULT_FAVORITE_FOLDER])
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false) // 用于触发收藏动画的状态

  // 触发收藏动画的函数
  const triggerFavoriteAnimation = useCallback(() => {
    setIsFavoriting(true);
    setTimeout(() => setIsFavoriting(false), 500); // 动画持续 500ms
  }, []);

  // 从localStorage加载数据或获取初始数据
  useEffect(() => {
    const loadInitialData = async () => {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);

      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }

      if (savedFavorites && JSON.parse(savedFavorites).length > 0) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Failed to parse favorites:', e);
        }
      } else {
        // 如果localStorage为空，则获取初始数据
        try {
          const initialData = await getFavorites();
          setFavorites(initialData);
        } catch (error) {
          console.error("Failed to load initial favorites:", error);
        }
      }
      
      setIsHydrated(true);
    };

    loadInitialData();
  }, []);

  // 保存设置
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    }
  }, [settings, isHydrated])

  // 保存收藏
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
    }
  }, [favorites, isHydrated])

  const updateCategoryOrder = useCallback((newOrder: string[]) => {
    setSettings(prev => ({ ...prev, categoryOrder: newOrder }))
  }, [])

  const toggleCategory = useCallback((categoryId: string) => {
    setSettings(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId)
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(id => id !== categoryId)
          : [...prev.selectedCategories, categoryId]
      }
    })
  }, [])

  const setSelectedCategories = useCallback((categoryIds: string[]) => {
    setSettings(prev => ({ ...prev, selectedCategories: categoryIds }))
  }, [])

  const addToFavorite = useCallback((cardId: string, folderId: string) => {
    setFavorites(prev => prev.map(folder => {
      if (folder.id === folderId && !folder.cardIds.includes(cardId)) {
        return {
          ...folder,
          cardIds: [...folder.cardIds, cardId],
          updatedAt: new Date().toISOString()
        }
      }
      return folder
    }))
  }, [])

  const removeFromFavorite = useCallback((cardId: string, folderId: string) => {
    setFavorites(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          cardIds: folder.cardIds.filter(id => id !== cardId),
          updatedAt: new Date().toISOString()
        }
      }
      return folder
    }))
  }, [])

  const createFolder = useCallback((name: string, color: string): FavoriteFolder => {
    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      cardIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setFavorites(prev => [...prev, newFolder])
    return newFolder
  }, [])

  const updateFolder = useCallback((folderId: string, updates: Partial<FavoriteFolder>) => {
    setFavorites(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, ...updates, updatedAt: new Date().toISOString() }
      }
      return folder
    }))
  }, [])

  const deleteFolder = useCallback((folderId: string) => {
    setFavorites(prev => {
      // 至少保留一个收藏夹
      if (prev.length <= 1) return prev
      return prev.filter(folder => folder.id !== folderId)
    })
  }, [])

  const isCardFavorited = useCallback((cardId: string): boolean => {
    return favorites.some(folder => folder.cardIds.includes(cardId))
  }, [favorites])

  const getFolderForCard = useCallback((cardId: string): FavoriteFolder | undefined => {
    return favorites.find(folder => folder.cardIds.includes(cardId))
  }, [favorites])

  const getCardsByCategory = useCallback((categoryId: string): KnowledgeCard[] => {
    return cards.filter(card => card.categoryId === categoryId)
  }, [cards])

  if (!isHydrated) {
    return null // 等待客户端hydration
  }

  return (
    <AppContext.Provider value={{
      categories,
      cards,
      favorites,
      settings,
      updateCategoryOrder,
      toggleCategory,
      setSelectedCategories,
      addToFavorite,
      removeFromFavorite,
      createFolder,
      updateFolder,
      deleteFolder,
      isCardFavorited,
      getFolderForCard,
      getCardsByCategory,
      isFavoriting,
      triggerFavoriteAnimation,
      isHydrated,
    }}>
      {children}
      <Toaster />
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
