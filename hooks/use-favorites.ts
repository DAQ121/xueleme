'use client'

import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { dataService } from '@/lib/services/data-service'
import type { FavoriteFolder } from '@/lib/types'

// 获取初始数据的函数
const getInitialFavorites = (): FavoriteFolder[] => {
  const saved = storage.get<FavoriteFolder[]>(STORAGE_KEYS.FAVORITES, [])
  return saved.length > 0 ? saved : dataService.getInitialFavorites()
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
      storage.set(STORAGE_KEYS.FAVORITES, favorites)
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
