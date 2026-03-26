'use client'

import { useState } from 'react';
import { motion, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Share2, Copy } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useCardDrag } from '@/hooks/use-card-drag';
import { useCardPool } from '@/hooks/use-card-pool';
import { CATEGORY_LABELS } from '@/lib/constants';
import { toast } from '@/lib/react-hot-toast.js';

const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true'

interface CardStackProps {
  categoryId: string
}

export function CardStack({ categoryId }: CardStackProps) {
  const { favorites, addToFavorite, isCardFavorited, triggerFavoriteAnimation, categories } = useApp()
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)

  const { pool, currentIndex, isFetching, goNext, goPrev, currentCard, markSeen } = useCardPool({
    categoryId,
    enabled: USE_API,
  })

  const {
    dragX,
    dragY,
    containerRef,
    showFolders,
    selectedFolderId,
    handleDrag,
    handleDragEnd,
  } = useCardDrag(
    pool,
    currentIndex,
    goNext,
    goPrev,
    setDirection,
    favorites,
    addToFavorite,
    triggerFavoriteAnimation,
    markSeen
  )

  // 获取当前卡片的分类名称
  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c.id === catId)
    if (found) return found.name
    return CATEGORY_LABELS[catId] || null
  }

  const handleCopy = async () => {
    if (!currentCard) return
    const text = currentCard.title
      ? `${currentCard.title}\n\n${currentCard.content}`
      : currentCard.content
    await navigator.clipboard.writeText(text)
    toast.success('已复制')
  }

  const handleShare = async () => {
    if (!currentCard) return
    const text = currentCard.title
      ? `${currentCard.title}\n\n${currentCard.content}`
      : currentCard.content
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('已复制')
    }
  }

  const rotate = useTransform(dragX, [0, 200], [0, 15])
  const favoriteOpacity = useTransform(dragX, [0, 50, 100], [0, 0.3, 1])
  const favoriteScale = useTransform(dragX, [0, 50, 100], [0.5, 0.8, 1])

  // 首次加载骨架屏
  if (!currentCard && isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-[92%] max-w-md aspect-[3/4] rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>暂无内容</p>
      </div>
    )
  }

  // 卡片动画配置
  const cardVariants = {
    enter: (dir: 'up' | 'down' | null) => ({
      y: dir === 'up' ? 300 : dir === 'down' ? -300 : 0,
      opacity: 0,
      scale: 0.9,
      rotateX: dir === 'up' ? -15 : dir === 'down' ? 15 : 0,
    }),
    center: { y: 0, opacity: 1, scale: 1, rotateX: 0 },
    exit: (dir: 'up' | 'down' | null) => ({
      y: dir === 'up' ? -300 : dir === 'down' ? 300 : 0,
      opacity: 0,
      scale: 0.9,
      rotateX: dir === 'up' ? 15 : dir === 'down' ? -15 : 0,
    }),
  }

  return (
    <>
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden flex flex-col"
      style={{ perspective: '1200px' }}
    >
      {/* 顶部激励语 - 移除，避免视觉割裂 */}

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
                  style={{ backgroundColor: folder.color }}
                  animate={{
                    scale: isSelected ? 1.2 : 1,
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(255,255,255,0.95), 0 8px 24px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className={`text-white font-semibold truncate max-w-24 ${isSelected ? 'text-sm' : 'text-xs'}`}>
                    {folder.name}
                  </span>
                  <Bookmark className={`text-white flex-shrink-0 ${isSelected ? 'w-5 h-5' : 'w-4 h-4'}`} fill={isSelected ? 'white' : 'none'} />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 卡片区域 */}
      <div className="flex-1 flex items-center justify-center px-3 relative">
        {/* 背景装饰卡片 */}
        <div className="absolute w-[92%] max-w-md aspect-[3/4] rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
          style={{ transform: 'translateY(16px) scale(0.92)', opacity: 0.4 }}
        />
        <div className="absolute w-[92%] max-w-md aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70"
          style={{ transform: 'translateY(8px) scale(0.96)', opacity: 0.7 }}
        />

        {/* 主卡片 */}
        <div className="relative w-[92%] max-w-md aspect-[3/4]">
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
                style={{ x: dragX, y: dragY, rotate }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={{ left: 0, right: 0.6, top: 0.3, bottom: 0.3 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

                  <div className="absolute inset-0 flex flex-col p-8 pt-10">
                    {/* 顶部：分类 badge + 收藏心形 */}
                    <div className="flex items-center justify-between mb-4">
                      {getCategoryName(currentCard.categoryId) && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/60">
                          {getCategoryName(currentCard.categoryId)}
                        </span>
                      )}
                      {isCardFavorited(currentCard.id) && (
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500 ml-auto" />
                      )}
                    </div>

                    {/* 中间：引号装饰 + 标题 + 正文 */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="self-start text-5xl text-slate-200 dark:text-slate-700 font-serif leading-none select-none -mb-4">
                        "
                      </div>

                      {currentCard.title && (
                        <p className="text-sm font-bold text-sky-500 dark:text-sky-400 text-center mb-3 relative z-10 tracking-wide">
                          {currentCard.title}
                        </p>
                      )}

                      <p className="text-lg md:text-xl font-medium leading-relaxed text-center text-balance text-slate-800 dark:text-slate-100 relative z-10">
                        {currentCard.content}
                      </p>

                      {(currentCard.author || currentCard.source) && (
                        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                          —— {currentCard.author || currentCard.source}
                        </p>
                      )}
                    </div>

                    {/* 底部：标签（左）+ 操作按钮（右） */}
                    <div className="flex items-end justify-between mt-4 gap-2">
                      {/* 标签 */}
                      <div className="flex gap-1.5 flex-wrap flex-1">
                        {currentCard.tags && currentCard.tags.map((tag, index) => {
                          const colors = [
                            'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/60',
                            'bg-sky-50 text-sky-600 border-sky-200/60 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700/60',
                            'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/60',
                          ]
                          return (
                            <span key={index} className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${colors[index % colors.length]}`}>
                              {tag}
                            </span>
                          )
                        })}
                      </div>

                      {/* 分享 + 复制 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={handleShare}
                          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 active:scale-90 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCopy}
                          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 active:scale-90 transition-all"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-500/20 pointer-events-none rounded-3xl"
                    style={{ opacity: favoriteOpacity }}
                  >
                    <motion.div style={{ scale: favoriteScale }} className="bg-white/90 dark:bg-slate-800/90 rounded-full p-4 shadow-xl">
                      <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 底部操作提示 */}
      <div className="flex items-center justify-center gap-4 py-2">
        <motion.button
          onClick={goPrev}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 active:scale-95 transition-transform"
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <span className="text-xs text-slate-500 dark:text-slate-400">上一条</span>
        </motion.button>

        <motion.div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 border border-rose-200/50 dark:border-rose-700/50"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <span className="text-xs font-medium text-rose-500 dark:text-rose-400">右滑收藏</span>
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
        </motion.div>

        <motion.button
          onClick={goNext}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 active:scale-95 transition-transform"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span className="text-xs text-slate-500 dark:text-slate-400">下一条</span>
        </motion.button>
      </div>
    </div>
    </>
  )
}
