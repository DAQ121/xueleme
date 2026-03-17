import { motion } from 'framer-motion'
import { MoreHorizontal, Pencil, Trash2, Bookmark } from 'lucide-react'
import type { FavoriteFolder } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function FolderCard({ 
  folder, 
  onEdit, 
  onDelete,
  onOpen 
}: { 
  folder: FavoriteFolder
  onEdit: () => void
  onDelete: () => void
  onOpen: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
      onClick={onOpen}
    >
      {/* 左侧颜色装饰条 */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: folder.color }}
      />
      
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${folder.color}20` }}
              >
                <Bookmark className="w-4 h-4" style={{ color: folder.color }} />
              </div>
              <h3 className="font-semibold truncate text-slate-800 dark:text-slate-100">{folder.name}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 pl-10">
              {folder.cardIds.length} 条内容
            </p>
          </div>
          {/* 三点操作按钮 */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
