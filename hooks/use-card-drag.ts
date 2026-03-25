import { useState, useCallback, useRef } from 'react'
import { useMotionValue, animate } from 'framer-motion'
import { toast } from '@/lib/react-hot-toast'
import type { KnowledgeCard, FavoriteFolder } from '@/lib/types'

export function useCardDrag(
  cards: KnowledgeCard[],
  currentIndex: number,
  goNext: () => void,
  goPrev: () => void,
  setDirection: (dir: 'up' | 'down' | null) => void,
  favorites: FavoriteFolder[],
  addToFavorite: (cardId: string, folderId: string) => void,
  triggerFavoriteAnimation: () => void,
  markSeen: (cardId: string) => void
) {
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showFolders, setShowFolders] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const updateSelectedFolder = useCallback((clientY: number) => {
    if (!containerRef.current || favorites.length === 0) return

    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = clientY - rect.top
    const centerY = rect.height / 2
    const folderHeight = 56
    const totalHeight = favorites.length * folderHeight
    const startY = centerY - totalHeight / 2

    const folderIndex = Math.floor((relativeY - startY) / folderHeight)
    const clampedIndex = Math.max(0, Math.min(favorites.length - 1, folderIndex))

    setSelectedFolderId(favorites[clampedIndex]?.id || null)
  }, [favorites])

  const handleDrag = useCallback((_: unknown, info: { offset: { x: number; y: number }; point: { y: number } }) => {
    const constrainedX = Math.max(0, info.offset.x)
    dragX.set(constrainedX)
    dragY.set(info.offset.y)

    if (constrainedX > 60 && !showFolders) {
      setShowFolders(true)
      if (favorites.length > 0) {
        setSelectedFolderId(favorites[0].id)
      }
    } else if (constrainedX <= 60 && showFolders) {
      setShowFolders(false)
      setSelectedFolderId(null)
    }

    if (showFolders && info.point.y) {
      updateSelectedFolder(info.point.y)
    }
  }, [dragX, dragY, showFolders, favorites, updateSelectedFolder])

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const { offset, velocity } = info
    const constrainedX = Math.max(0, offset.x)
    const currentCard = cards[currentIndex]

    if (constrainedX > 100 || (constrainedX > 50 && velocity.x > 400)) {
      const folderId = selectedFolderId || favorites[0]?.id
      if (currentCard && folderId) {
        addToFavorite(currentCard.id, folderId)
        triggerFavoriteAnimation()
        toast.success('已收藏')
      }
      setShowFolders(false)
      setSelectedFolderId(null)
      // 右滑收藏后前进到下一张
      if (currentCard) markSeen(currentCard.id)
      setDirection('up')
      goNext()
      return
    }

    const threshold = 50
    const velocityThreshold = 200

    if (offset.y < -threshold || velocity.y < -velocityThreshold) {
      if (currentCard) markSeen(currentCard.id)
      setDirection('up')
      goNext()
    } else if (offset.y > threshold || velocity.y > velocityThreshold) {
      setDirection('down')
      goPrev()
    }

    setShowFolders(false)
    setSelectedFolderId(null)
    animate(dragX, 0, { type: 'spring', stiffness: 400, damping: 30 })
    animate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }, [cards, currentIndex, favorites, addToFavorite, dragX, dragY, triggerFavoriteAnimation, selectedFolderId, goNext, goPrev, setDirection, markSeen])

  return {
    dragX,
    dragY,
    containerRef,
    showFolders,
    selectedFolderId,
    handleDrag,
    handleDragEnd,
  }
}
