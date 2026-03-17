// 专题/分类
export interface Category {
  id: string
  name: string
  order: number
}

// 知识卡片
export interface KnowledgeCard {
  id: string
  categoryId: string
  content: string
  author?: string
  source?: string
  gradient: string // 渐变色类名
  createdAt: string
}

// 收藏夹
export type FavoriteFolder = {
  id: string
  name: string
  cardIds: string[]
  color: string // 颜色代码
  order: number
  createdAt: string
  updatedAt: string
}

// 搜索结果卡片
export type SearchResultCard = KnowledgeCard & {
  folderName: string
  folderColor: string
}

// 用户设置
export interface UserSettings {
  selectedCategories: string[]
  categoryOrder: string[]
  theme: 'light' | 'dark' | 'system'
}

// 应用状态
export interface AppState {
  categories: Category[]
  cards: KnowledgeCard[]
  favorites: FavoriteFolder[]
  settings: UserSettings
}
