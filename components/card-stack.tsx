'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, ChevronUp, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from '@/lib/react-hot-toast';
import { useApp } from '@/lib/app-context';
import type { KnowledgeCard as CardType } from '@/lib/types';

// 激励语句
const MOTIVATION_QUOTES = [
  '每天进步一点点',
  '知识改变命运',
  '学无止境',
  '今日所学，明日之基',
  '积跬步以至千里',
  '博学笃行',
  '知识就是力量',
  '学而时习之',
]

interface CardStackProps {
  categoryId: string
  cards: CardType[]
}



// ...

export function CardStack({ categoryId, cards: allCards }: CardStackProps) {
  const { favorites, addToFavorite, isCardFavorited, triggerFavoriteAnimation } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showFolders, setShowFolders] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const [motivationQuote, setMotivationQuote] = useState<string>('')

  useEffect(() => {
    // 仅在客户端设置随机名言，以避免水合不匹配
    setMotivationQuote(MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)])
  }, [])
  
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  const cards = useMemo(() => {
    return allCards.filter(card => card.categoryId === categoryId)
  }, [categoryId, allCards])

  useEffect(() => {
    setCurrentIndex(0)
    setDirection(null)
  }, [categoryId])

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
    // 禁止左滑
    const constrainedX = Math.max(0, info.offset.x)
    dragX.set(constrainedX)
    dragY.set(info.offset.y)
    
    // 显示收藏夹
    if (constrainedX > 60 && !showFolders) {
      setShowFolders(true)
      if (favorites.length > 0) {
        setSelectedFolderId(favorites[0].id)
      }
    } else if (constrainedX <= 60 && showFolders) {
      setShowFolders(false)
      setSelectedFolderId(null)
    }
    
    // 根据Y坐标选择收藏夹
    if (showFolders && info.point.y) {
      updateSelectedFolder(info.point.y)
    }
  }, [dragX, dragY, showFolders, favorites, updateSelectedFolder])

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const { offset, velocity } = info
    const constrainedX = Math.max(0, offset.x)
    const currentCard = cards[currentIndex]

    // 右滑收藏
    if (constrainedX > 100 || (constrainedX > 50 && velocity.x > 400)) {
      const folderId = favorites[0]?.id || 'default'
      if (currentCard) {
        addToFavorite(currentCard.id, folderId)
        triggerFavoriteAnimation()
        toast.success('已收藏')
      }
      setShowFolders(false)
      setSelectedFolderId(null)

      // 收藏后切换到下一张
      if (currentIndex < cards.length - 1) {
        setDirection('up')
        setCurrentIndex(prev => prev + 1)
      } else {
        // 如果是最后一张，则弹回
        animate(dragX, 0, { type: 'spring', stiffness: 400, damping: 30 })
        animate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
      }
      return
    }

    // 上下滑动切换卡片
    const threshold = 50
    const velocityThreshold = 200

    if (offset.y < -threshold || velocity.y < -velocityThreshold) {
      // 上滑 - 下一张
      if (currentIndex < cards.length - 1) {
        setDirection('up')
        setCurrentIndex(prev => prev + 1)
      }
    } else if (offset.y > threshold || velocity.y > velocityThreshold) {
      // 下滑 - 上一张
      if (currentIndex > 0) {
        setDirection('down')
        setCurrentIndex(prev => prev - 1)
      }
    }

    setShowFolders(false)
    setSelectedFolderId(null)
    animate(dragX, 0, { type: 'spring', stiffness: 400, damping: 30 })
    animate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }, [cards, currentIndex, favorites, addToFavorite, dragX, dragY, triggerFavoriteAnimation])

  const currentCard = cards[currentIndex]

  if (cards.length === 0 || !currentCard) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>暂无内容</p>
      </div>
    )
  }

  const rotate = useTransform(dragX, [0, 200], [0, 15])
  const favoriteOpacity = useTransform(dragX, [0, 50, 100], [0, 0.3, 1])
  const favoriteScale = useTransform(dragX, [0, 50, 100], [0.5, 0.8, 1])

  // 卡片动画配置
  const cardVariants = {
    enter: (direction: 'up' | 'down' | null) => ({
      y: direction === 'up' ? 300 : direction === 'down' ? -300 : 0,
      opacity: 0,
      scale: 0.9,
      rotateX: direction === 'up' ? -15 : direction === 'down' ? 15 : 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
    },
    exit: (direction: 'up' | 'down' | null) => ({
      y: direction === 'up' ? -300 : direction === 'down' ? 300 : 0,
      opacity: 0,
      scale: 0.9,
      rotateX: direction === 'up' ? 15 : direction === 'down' ? -15 : 0,
    }),
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden flex flex-col"
      style={{ perspective: '1200px' }}
    >
      {/* 顶部激励语 */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Sparkles className="w-4 h-4 text-amber-500/70" />
        <p className="text-sm font-medium text-muted-foreground/70 tracking-wide">{motivationQuote}</p>
        <Sparkles className="w-4 h-4 text-amber-500/70" />
      </div>

      {/* 收藏夹侧边栏 */}
      <AnimatePresence>
        {showFolders && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3 z-30"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
          >
            {favorites.map((folder) => {
              const isSelected = selectedFolderId === folder.id
              return (
                <motion.div
                  key={folder.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: folder.color,
                  }}
                  animate={{
                    scale: isSelected ? 1.2 : 1,
                    boxShadow: isSelected 
                      ? '0 0 0 3px rgba(255,255,255,0.95), 0 8px 24px rgba(0,0,0,0.2)' 
                      : '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className={`text-white font-semibold truncate max-w-24 ${
                    isSelected ? 'text-sm' : 'text-xs'
                  }`}>
                    {folder.name}
                  </span>
                  <Bookmark className={`text-white flex-shrink-0 ${
                    isSelected ? 'w-5 h-5' : 'w-4 h-4'
                  }`} fill={isSelected ? 'white' : 'none'} />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 卡片区域 */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        {/* 背景装饰卡片 - 静态层 */}
        <div className="absolute w-[85%] max-w-sm aspect-[3/4] rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
          style={{ transform: 'translateY(16px) scale(0.92)', opacity: 0.4 }}
        />
        <div className="absolute w-[85%] max-w-sm aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70"
          style={{ transform: 'translateY(8px) scale(0.96)', opacity: 0.7 }}
        />

        {/* 主卡片 - 动态切换 */}
        <div className="relative w-[85%] max-w-sm aspect-[3/4]">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentCard.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 350, damping: 30 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 },
                rotateX: { duration: 0.3 },
              }}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
                style={{
                  x: dragX,
                  y: dragY,
                  rotate,
                }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={{ left: 0, right: 0.6, top: 0.3, bottom: 0.3 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
                  {/* 顶部装饰条 */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                  
                  {/* 内容 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-10">
                    {isCardFavorited(currentCard.id) && (
                      <div className="absolute top-5 right-5">
                        <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                      </div>
                    )}
                    
                    {/* 引号装饰 */}
                    <div className="absolute top-8 left-6 text-6xl text-slate-200 dark:text-slate-700 font-serif leading-none select-none">
                      "
                    </div>
                    
                    <p className="text-lg md:text-xl font-medium leading-relaxed text-center text-balance text-slate-800 dark:text-slate-100 relative z-10">
                      {currentCard.content}
                    </p>
                    
                    {(currentCard.author || currentCard.source) && (
                      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        —— {currentCard.author || currentCard.source}
                      </p>
                    )}
                    
                    {/* 分类标签 */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {currentCard.categoryId === 'funny' && '搞笑'}
                        {currentCard.categoryId === 'history' && '历史'}
                        {currentCard.categoryId === 'military' && '军事'}
                        {currentCard.categoryId === 'science' && '科学'}
                        {currentCard.categoryId === 'philosophy' && '哲理'}
                        {currentCard.categoryId === 'life' && '生活'}
                        {currentCard.categoryId === 'tech' && '科技'}
                        {currentCard.categoryId === 'art' && '艺术'}
                        {currentCard.categoryId === 'sports' && '体育'}
                        {currentCard.categoryId === 'food' && '美食'}
                      </span>
                    </div>
                  </div>

                  {/* 收藏指示动画 */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-500/20 pointer-events-none rounded-3xl"
                    style={{ opacity: favoriteOpacity }}
                  >
                    <motion.div 
                      style={{ scale: favoriteScale }}
                      className="bg-white/90 dark:bg-slate-800/90 rounded-full p-4 shadow-xl"
                    >
                      <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 底部操作提示 - 简约风格 */}
      <div className="flex items-center justify-center gap-3 py-5">
        {/* 上一条 */}
        <motion.div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">下一条</span>
        </motion.div>
        
        {/* 收藏 - 突出显示 */}
        <motion.div 
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 border border-rose-200/50 dark:border-rose-700/50"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">右滑收藏</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
        </motion.div>
        
        {/* 下一条 */}
        <motion.div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">上一条</span>
        </motion.div>
      </div>
    </div>
  )
}
