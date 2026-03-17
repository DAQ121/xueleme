import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, ChevronRight } from 'lucide-react'
import { FloatingCloseButton } from '@/components/ui/floating-close-button'
import type { FavoriteFolder } from '@/lib/types'

export function MoveFolderModal({
  folders,
  currentFolderId,
  onMove,
  onClose,
}: {
  folders: FavoriteFolder[]
  currentFolderId: string
  onMove: (targetFolderId: string) => void
  onClose: () => void
}) {
  const otherFolders = folders.filter(f => f.id !== currentFolderId)

  // 锁定body滚动
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <FloatingCloseButton onClick={onClose} />
        
        {/* 头部 */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <h3 className="font-semibold text-lg text-center">移动到其他收藏夹</h3>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {otherFolders.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">没有其他收藏夹</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">请先创建新的收藏夹</p>
            </div>
          ) : (
            <div className="space-y-2">
              {otherFolders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onMove(f.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${f.color}20` }}
                  >
                    <Bookmark className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-medium text-slate-800 dark:text-slate-100 block truncate">{f.name}</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{f.cardIds.length} 条内容</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
