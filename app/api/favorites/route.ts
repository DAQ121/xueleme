import { NextResponse } from 'next/server'
import { MOCK_CATEGORIES, MOCK_CARDS, FOLDER_COLOR_PRESETS } from '@/lib/mock-data'
import type { FavoriteFolder } from '@/lib/types'

export async function GET() {
  // 模拟 app-context 中的初始状态
  const initialFavorites: FavoriteFolder[] = MOCK_CATEGORIES.map((category, index) => ({
    ...category,
    color: FOLDER_COLOR_PRESETS[index % FOLDER_COLOR_PRESETS.length],
    cardIds: MOCK_CARDS.filter(c => c.categoryId === category.id).map(c => c.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  await new Promise(resolve => setTimeout(resolve, 300))

  return NextResponse.json(initialFavorites)
}
