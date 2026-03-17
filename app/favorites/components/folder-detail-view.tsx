import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Bookmark } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { MOCK_CARDS } from '@/lib/mock-data'
import type { FavoriteFolder } from '@/lib/types'
import { CardDetailModal } from './card-detail-modal'
import { MoveFolderModal } from './move-folder-modal'
import { SwipeableCard } from './swipeable-card'

export function FolderDetailView({
  folder,
  onClose,
}: {
  folder: FavoriteFolder
  onClose: () => void
}) {
  const { favorites, removeFromFavorite, addToFavorite } = useApp()
  const [selectedCard, setSelectedCard] = useState<typeof MOCK_CARDS[0] | null>(null)
  const [movingCardId, setMovingCardId] = useState<string | null>(null)
  
  // 实时获取卡片，这样删除后会自动更新
  const currentFolder = favorites.find(f => f.id === folder.id)
  const cards = MOCK_CARDS.filter(c => currentFolder?.cardIds.includes(c.id) || false)

  const handleRemoveCard = (cardId: string) => {
    removeFromFavorite(cardId, folder.id)
  }

  const handleMoveCard = (targetFolderId: string) => {
    if (movingCardId) {
      removeFromFavorite(movingCardId, folder.id)
      addToFavorite(movingCardId, targetFolderId)
      setMovingCardId(null)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 z-40"
    >
      <div className="flex flex-col h-full">
        <header className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm pt-safe flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: folder.color }} 
                />
                <h1 className="text-lg font-semibold">{folder.name}</h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{cards.length} 条收藏</p>
            </div>
          </div>
        </header>

        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
          左滑卡片可删除或移动，点击查看详情
        </p>

        <div className="flex-1 overflow-y-auto px-4 pb-20">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Bookmark className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">暂无收藏内容</p>
              <p className="text-sm mt-1 opacity-70">去首页右滑收藏知识卡片吧</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <AnimatePresence>
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  >
                    <SwipeableCard
                      card={card}
                      folderId={folder.id}
                      onRemove={handleRemoveCard}
                      onMoveClick={(cardId) => setMovingCardId(cardId)}
                      onClick={() => setSelectedCard(card)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* 卡片详情弹窗 */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>

      {/* 移动收藏夹弹窗 */}
      <AnimatePresence>
        {movingCardId && (
          <MoveFolderModal
            folders={favorites}
            currentFolderId={folder.id}
            onMove={handleMoveCard}
            onClose={() => setMovingCardId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
