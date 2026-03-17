'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { CategoryTabs } from '@/components/category-tabs'
import { CardStack } from '@/components/card-stack'
import { BottomNav } from '@/components/bottom-nav'
import type { KnowledgeCard } from '@/lib/types'

export function HomeContent({ allCards }: { allCards: KnowledgeCard[] }) {
  const { settings } = useApp()
  const [activeCategory, setActiveCategory] = useState(
    settings.selectedCategories[0] || 'funny'
  )

  return (
    <main className="flex flex-col h-[100dvh] bg-background">
      <header className="flex items-center justify-center pt-safe px-4 py-3">
        <h1 className="text-xl font-bold">学了么</h1>
      </header>

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <CardStack categoryId={activeCategory} cards={allCards} />

      <div className="h-16" />

      <BottomNav />
    </main>
  )
}
