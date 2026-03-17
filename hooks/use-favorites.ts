'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOCK_CATEGORIES, MOCK_CARDS, FOLDER_COLOR_PRESETS } from '@/lib/mock-data'
import type { FavoriteFolder } from '@/lib/types'

const STORAGE_KEY = 'xueleme-favorites'

// 获取初始数据的函数，这个逻辑之前在 AppContext 中
const getInitialFavorites = (): FavoriteFolder[] => {
  const savedFavorites = localStorage.getItem(STORAGE_KEY)
  if (savedFavorites) {
    try {
      const parsed = JSON.parse(savedFavorites)
      if (parsed.length > 0) return parsed
    } catch (e) {
      console.error('Failed to parse favorites from localStorage:', e)
    }
  }
  // 如果 localStorage 为空或解析失败，则返回基于 mock 数据的初始值
  return MOCK_CATEGORIES.map((category, index) => ({
    ...category,
    color: FOLDER_COLOR_PRESETS[index % FOLDER_COLOR_PRESETS.length],
    cardIds: MOCK_CARDS.filter(c => c.categoryId === category.id).map(c => c.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteFolder[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setFavorites(getInitialFavorites())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    }
  }, [favorites, isHydrated])

  const createFolder = useCallback((name: string, color: string) => {
    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      order: favorites.length,
      cardIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setFavorites(prev => [...prev, newFolder])
  }, [favorites.length])

  const updateFolder = useCallback((folderId: string, updates: Partial<Pick<FavoriteFolder, 'name' | 'color'>>) => {
    setFavorites(prev => 
      prev.map(f => f.id === folderId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)
    )
  }, [])

  const deleteFolder = useCallback((folderId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== folderId))
  }, [])

  const addToFavorite = useCallback((cardId: string, folderId: string) => {
    setFavorites(prev => 
      prev.map(f => {
        if (f.id === folderId && !f.cardIds.includes(cardId)) {
          return { ...f, cardIds: [...f.cardIds, cardId] }
        }
        return f
      })
    )
  }, [])

  const removeFromFavorite = useCallback((cardId: string, folderId: string) => {
    setFavorites(prev => 
      prev.map(f => {
        if (f.id === folderId) {
          return { ...f, cardIds: f.cardIds.filter(id => id !== cardId) }
        }
        return f
      })
    )
  }, [])

  const isCardFavorited = useCallback((cardId: string) => {
    return favorites.some(f => f.cardIds.includes(cardId))
  }, [favorites])

  return {
    favorites,
    isHydrated,
    createFolder,
    updateFolder,
    deleteFolder,
    addToFavorite,
    removeFromFavorite,
    isCardFavorited,
  }
}
