'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { CategoryTabs } from '@/components/category-tabs'
import { CardStack } from '@/components/card-stack'
import { BottomNav } from '@/components/bottom-nav'

export function HomeContent() {
  const { settings } = useApp()
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    if (!activeCategory && settings.selectedCategories.length > 0) {
      setActiveCategory(settings.selectedCategories[0])
    }
  }, [settings.selectedCategories])

  return (
    <main className="flex flex-col h-[100dvh] bg-background">
      <header className="flex items-center justify-center pt-safe px-4 py-2">
        <h1 className="text-lg font-bold">学了么</h1>
      </header>

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <CardStack categoryId={activeCategory} />

      <div className="h-14" />

      <BottomNav />
    </main>
  )
}
