'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { getCards } from '@/lib/data'
import { CategoryTabs } from '@/components/category-tabs'
import { CardStack } from '@/components/card-stack'
import { CardStackSkeleton } from '@/components/card-stack-skeleton'
import { BottomNav } from '@/components/bottom-nav'
import type { KnowledgeCard } from '@/lib/types'

export function HomeContent() {
  const { settings } = useApp()
  const [allCards, setAllCards] = useState<KnowledgeCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(
    settings.selectedCategories[0] || 'funny'
  )

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const cards = await getCards()
        setAllCards(cards)
      } catch (error) {
        console.error('Failed to fetch cards:', error)
        // 在这里可以设置一个错误状态并在UI中显示
      }
      setIsLoading(false)
    }
    fetchCards()
  }, [])

  return (
    <main className="flex flex-col h-[100dvh] bg-background">
      {/* 顶部标题 */}
      <header className="flex items-center justify-center pt-safe px-4 py-3">
        <h1 className="text-xl font-bold">学了么</h1>
      </header>

      {/* 专题Tab */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* 卡片区域 */}
      {isLoading ? (
        <CardStackSkeleton />
      ) : (
        <CardStack categoryId={activeCategory} cards={allCards} />
      )}

      {/* 底部导航占位 */}
      <div className="h-16" />

      {/* 底部导航 */}
      <BottomNav />
    </main>
  )
}
