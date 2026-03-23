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
  gradient: string
  createdAt: string
}

// 收藏夹
export interface FavoriteFolder {
  id: string
  name: string
  cardIds: string[]
  color: string
  order: number
  createdAt: string
  updatedAt: string
}

// 搜索结果卡片
export interface SearchResultCard extends KnowledgeCard {
  folderName: string
  folderColor: string
}

// 用户设置
export interface UserSettings {
  selectedCategories: string[]
  categoryOrder: string[]
  theme: 'light' | 'dark' | 'system'
}
