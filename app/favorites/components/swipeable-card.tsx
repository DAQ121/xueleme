import { useState } from 'react'
import { motion } from 'framer-motion'

export function SwipeableCard({
  card,
  folderId,
  onRemove,
  onMoveClick,
  onClick,
}: {
  card: { id: string; content: string; author?: string; source?: string }
  folderId: string
  onRemove: (cardId: string) => void
  onMoveClick: (cardId: string) => void
  onClick: () => void
}) {
  const [dragX, setDragX] = useState(0)
  const [showActions, setShowActions] = useState(false)

  const handleDragEnd = () => {
    if (dragX < -60) {
      setShowActions(true)
    } else {
      setShowActions(false)
    }
    setDragX(0)
  }

  const handleRemove = () => {
    onRemove(card.id)
    setShowActions(false)
  }

  const handleMoveClick = () => {
    onMoveClick(card.id)
    setShowActions(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 操作按钮背景 */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <motion.button
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: showActions ? 65 : 0, 
            opacity: showActions ? 1 : 0 
          }}
          onClick={handleMoveClick}
          className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
        >
          移动
        </motion.button>
        <motion.button
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: showActions ? 65 : 0, 
            opacity: showActions ? 1 : 0 
          }}
          onClick={handleRemove}
          className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
        >
          删除
        </motion.button>
      </div>

      {/* 卡片内容 - 固定高度 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -130, right: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: showActions ? -130 : 0 }}
        onClick={() => {
          if (showActions) {
            setShowActions(false)
          } else {
            onClick()
          }
        }}
        className="h-28 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl relative cursor-pointer active:cursor-grabbing flex flex-col"
        style={{ touchAction: 'pan-y' }}
      >
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 line-clamp-3 flex-1">
          {card.content}
        </p>
        {(card.author || card.source) && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-2">
            —— {card.author || card.source}
          </p>
        )}
      </motion.div>
    </div>
  )
}
