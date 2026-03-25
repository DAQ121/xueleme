'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Pencil, Trash2, XCircle, ChevronLeft, ArrowRight, Bookmark, ChevronRight, Search, X } from 'lucide-react'
import { AppProvider, useApp } from '@/lib/app-context'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { FloatingCloseButton } from '@/components/ui/floating-close-button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useDebounce } from '@/hooks/use-debounce'
import { FolderCard } from './components/folder-card'
import { EditFolderModal } from './components/edit-folder-modal'
import { CardDetailModal } from './components/card-detail-modal'
import { MoveFolderModal } from './components/move-folder-modal'
import { SwipeableCard } from './components/swipeable-card'
import { FolderDetailView } from './components/folder-detail-view'
import { SearchResultsList } from './components/search-results-list'
import type { FavoriteFolder, SearchResultCard } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'















function FavoritesContent() {
  const { favorites, createFolder, updateFolder, deleteFolder, isHydrated, cards } = useApp()
  const [editingFolder, setEditingFolder] = useState<FavoriteFolder | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [viewingFolder, setViewingFolder] = useState<FavoriteFolder | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCard, setSelectedCard] = useState<SearchResultCard | null>(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  // 搜索逻辑 - 使用 useMemo 优化
  const searchResults = useMemo(() => {
    if (debouncedQuery.trim() === '') return []

    const allFavoriteCards = favorites.flatMap(folder =>
      folder.cardIds.map(cardId => {
        const card = cards.find(c => c.id === cardId)
        return card ? { ...card, folderName: folder.name, folderColor: folder.color } : null
      })
    ).filter(Boolean) as SearchResultCard[]

    const query = debouncedQuery.toLowerCase()
    return allFavoriteCards.filter(card =>
      card.content.toLowerCase().includes(query) ||
      card.author?.toLowerCase().includes(query) ||
      card.source?.toLowerCase().includes(query)
    )
  }, [debouncedQuery, favorites, cards])

  if (!isHydrated) {
    return (
      <main className="flex flex-col min-h-[100dvh] items-center justify-center">
        <Spinner />
      </main>
    )
  }

  const handleCreateFolder = (name: string, color: string) => {
    createFolder(name, color)
    setIsCreating(false)
  }

  const handleUpdateFolder = (name: string, color: string) => {
    if (editingFolder) {
      updateFolder(editingFolder.id, { name, color })
      setEditingFolder(null)
    }
  }

  const handleDeleteFolder = () => {
    if (deletingFolderId) {
      deleteFolder(deletingFolderId)
      setDeletingFolderId(null)
    }
  }

  const folderToDelete = favorites.find(f => f.id === deletingFolderId)
  const totalCards = favorites.reduce((sum, f) => sum + f.cardIds.length, 0)
  
  return (
    <>
      <main className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* 顶部 */}
        <header className="pt-safe px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">我的收藏</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {favorites.length} 个收藏夹 · {totalCards} 条内容
              </p>
            </div>
            <Button
              size="icon"
              onClick={() => setIsCreating(true)}
              className="rounded-xl h-10 w-10 bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200"
            >
              <Plus className="w-5 h-5 text-white dark:text-slate-800" />
            </Button>
          </div>
          {/* 装饰性文字 */}
          <div className="flex items-center justify-center gap-2 py-3 border-y border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600" />
            <p className="text-slate-400 dark:text-slate-500 text-xs tracking-widest">
              你的收藏都会成为你的谈资
            </p>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600" />
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input 
              placeholder="在收藏中搜索..."
              className="pl-9 bg-white dark:bg-slate-800/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* 主内容区: 搜索结果或收藏夹列表 */}
        <div className="flex-1 px-5 pb-20 overflow-y-auto">
          {searchQuery ? (
            <SearchResultsList 
              results={searchResults} 
              query={searchQuery}
              onItemClick={setSelectedCard}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 py-2">
              <AnimatePresence>
                {favorites.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onEdit={() => setEditingFolder(folder)}
                    onDelete={() => setDeletingFolderId(folder.id)}
                    onOpen={() => setViewingFolder(folder)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* 搜索结果点击后的卡片详情弹窗 */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>

      {/* 底部导航 */}
      <BottomNav />

      {/* 编辑/新建收藏夹弹窗 */}
      <AnimatePresence>
        {(isCreating || editingFolder) && (
          <EditFolderModal
            folder={editingFolder || undefined}
            isNew={isCreating}
            onSave={isCreating ? handleCreateFolder : handleUpdateFolder}
            onClose={() => {
              setIsCreating(false)
              setEditingFolder(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* 收藏夹详情页 */}
      <AnimatePresence>
        {viewingFolder && (
          <FolderDetailView
            folder={viewingFolder}
            onClose={() => setViewingFolder(null)}
          />
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deletingFolderId} onOpenChange={() => setDeletingFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除收藏夹</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>确定要删除「{folderToDelete?.name}」吗？</p>
                {folderToDelete && folderToDelete.cardIds.length > 0 && (
                  <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">
                    此收藏夹中有 {folderToDelete.cardIds.length} 条内容，删除后将无法恢复。
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}



export default function FavoritesPage() {
  return (
    <AppProvider>
      <FavoritesContent />
    </AppProvider>
  )
}
