/**
 * 应用常量配置
 */

// 分类映射
export const CATEGORY_LABELS: Record<string, string> = {
  funny: '搞笑',
  history: '历史',
  military: '军事',
  science: '科学',
  philosophy: '哲理',
  life: '生活',
  tech: '科技',
  art: '艺术',
  sports: '体育',
  food: '美食',
} as const

// 激励语句
export const MOTIVATION_QUOTES = [
  '每天进步一点点',
  '知识改变命运',
  '学无止境',
  '今日所学，明日之基',
  '积跬步以至千里',
  '博学笃行',
  '知识就是力量',
  '学而时习之',
] as const

// 收藏夹颜色预设
export const FOLDER_COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
] as const

// 应用版本
export const APP_VERSION = 'v1.0.0'

// 应用名称
export const APP_NAME = '学了么'
