'use client'

import { motion } from 'framer-motion'
import type { SearchResultCard } from '@/lib/types'

export function SearchResultsList({ 
  results, 
  query, 
  onItemClick 
}: {
  results: SearchResultCard[],
  query: string,
  onItemClick: (card: SearchResultCard) => void
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">没有找到与 "{query}" 相关的内容</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 py-2">
      <p className="text-sm text-slate-500 dark:text-slate-400 px-1 pb-1">找到 {results.length} 条相关内容</p>
      {results.map(card => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onItemClick(card)}
          className="bg-white dark:bg-slate-800/50 p-4 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <p className="text-slate-800 dark:text-slate-100 line-clamp-2">{card.content}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-slate-500">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.folderColor }} />
            <span>{card.folderName}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
