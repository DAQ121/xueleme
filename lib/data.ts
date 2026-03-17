import { USE_API_DATA } from './config';
import { MOCK_CARDS, MOCK_CATEGORIES, FOLDER_COLOR_PRESETS } from './mock-data';
import type { KnowledgeCard, FavoriteFolder } from './types';

const API_BASE_URL = 'http://localhost:3000/api';

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}`);
  }
  return response.json();
}

export async function getCards(categoryId?: string): Promise<KnowledgeCard[]> {
  if (USE_API_DATA) {
    const endpoint = categoryId ? `cards?categoryId=${categoryId}` : 'cards';
    return fetchFromAPI<KnowledgeCard[]>(endpoint);
  } else {
    // 如果使用 mock 数据，则模拟 API 的行为
    let cards = MOCK_CARDS;
    if (categoryId) {
      cards = MOCK_CARDS.filter(card => card.categoryId === categoryId);
    }
    return Promise.resolve(cards);
  }
}

export async function getFavorites(): Promise<FavoriteFolder[]> {
  if (USE_API_DATA) {
    return fetchFromAPI<FavoriteFolder[]>('favorites');
  } else {
    // 模拟 app-context 中的初始状态
    const initialFavorites: FavoriteFolder[] = MOCK_CATEGORIES.map((category, index) => ({
      ...category,
      color: FOLDER_COLOR_PRESETS[index % FOLDER_COLOR_PRESETS.length],
      cardIds: MOCK_CARDS.filter(c => c.categoryId === category.id).map(c => c.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return Promise.resolve(initialFavorites);
  }
}
