import { create } from 'zustand'
import { MOCK_CATEGORIES, MOCK_CARDS } from '@/lib/mock-data'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { dataService } from '@/lib/services/data-service'
import { ApiError } from '@/lib/api/client';
import type { Category, KnowledgeCard, UserSettings, FavoriteFolder } from '@/lib/types'

const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true'

interface AppStore {
  // State
  user: any; // Replace 'any' with a proper User type
  categories: Category[];
  cards: KnowledgeCard[];
  favorites: FavoriteFolder[];
  settings: UserSettings;
  isHydrated: boolean;
  isFavoriting: boolean;

  // Actions
  hydrate: () => Promise<void>;
  createFolder: (name: string, color: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Pick<FavoriteFolder, 'name' | 'color'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addToFavorite: (cardId: string, folderId: string) => Promise<void>;
  removeFromFavorite: (cardId: string, folderId: string) => Promise<void>;
  isCardFavorited: (cardId: string) => boolean;
  updateCategoryOrder: (order: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  triggerFavoriteAnimation: () => void;
}

const defaultSettings: UserSettings = {
  selectedCategories: [],
  categoryOrder: [],
  theme: 'system',
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  categories: [],
  cards: [],
  favorites: [],
  settings: defaultSettings,
  isHydrated: false,
  isFavoriting: false,

  hydrate: async () => {
    if (get().isHydrated) return;

    try {
      if (USE_API) {
        // Fetch core content and user info concurrently; user failure must not block content
        const [categories, cardsRes, user] = await Promise.all([
          dataService.getCategories(),
          dataService.getCards(),
          dataService.getMe().catch(() => null),
        ]);

        let favorites: FavoriteFolder[] = [];
        let settings: UserSettings | null = null;

        if (user) {
          // If user exists, fetch user-specific data
          [favorites, settings] = await Promise.all([
            dataService.getFavorites(),
            dataService.getSettings(),
          ]);
        }

        // 如果没有 settings，使用从 API 获取的分类初始化
        const finalSettings = settings || {
          selectedCategories: categories.slice(0, 5).map(c => c.id),
          categoryOrder: categories.map(c => c.id),
          theme: 'system' as const,
        };

        // Atomically set all state at once
        set({
          categories,
          cards: cardsRes,
          user,
          favorites,
          settings: finalSettings,
          isHydrated: true,
        });

      } else {
        // Local mock mode
        const savedFavorites = storage.get<FavoriteFolder[]>(STORAGE_KEYS.FAVORITES, []);
        const favorites = savedFavorites.length > 0 ? savedFavorites : dataService.getInitialFavorites();
        const mockSettings = {
          selectedCategories: MOCK_CATEGORIES.slice(0, 5).map(c => c.id),
          categoryOrder: MOCK_CATEGORIES.map(c => c.id),
          theme: 'system' as const,
        };
        const settings = storage.get<UserSettings>(STORAGE_KEYS.SETTINGS, mockSettings);
        set({
          categories: MOCK_CATEGORIES,
          cards: MOCK_CARDS,
          favorites,
          settings,
          isHydrated: true
        });
      }
    } catch (e) {
      console.error('Hydration failed:', e);
      // Even if hydration fails, mark as hydrated to prevent re-runs
      set({ isHydrated: true });
    }
  },

  createFolder: async (name, color) => {
    if (USE_API) {
      const { favoritesApi } = await import('@/lib/api')
      const folder = await favoritesApi.create(name, color)
      set(state => ({ favorites: [...state.favorites, folder] }))
    } else {
      const newFolder: FavoriteFolder = {
        id: `folder-${Date.now()}`,
        name,
        color,
        order: get().favorites.length,
        cardIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const favorites = [...get().favorites, newFolder]
      set({ favorites })
      storage.set(STORAGE_KEYS.FAVORITES, favorites)
    }
  },

  updateFolder: async (id, updates) => {
    if (USE_API) {
      const { favoritesApi } = await import('@/lib/api')
      await favoritesApi.update(id, updates)
    }
    const favorites = get().favorites.map(f =>
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    )
    set({ favorites })
    if (!USE_API) storage.set(STORAGE_KEYS.FAVORITES, favorites)
  },

  deleteFolder: async (id) => {
    if (USE_API) {
      const { favoritesApi } = await import('@/lib/api')
      await favoritesApi.delete(id)
    }
    const favorites = get().favorites.filter(f => f.id !== id)
    set({ favorites })
    if (!USE_API) storage.set(STORAGE_KEYS.FAVORITES, favorites)
  },

  addToFavorite: async (cardId, folderId) => {
    if (USE_API) {
      const { favoritesApi } = await import('@/lib/api')
      await favoritesApi.addCard(folderId, cardId)
    }
    const favorites = get().favorites.map(f => {
      if (f.id === folderId && !f.cardIds.includes(cardId)) {
        return { ...f, cardIds: [...f.cardIds, cardId] }
      }
      return f
    })
    set({ favorites })
    if (!USE_API) storage.set(STORAGE_KEYS.FAVORITES, favorites)
  },

  removeFromFavorite: async (cardId, folderId) => {
    if (USE_API) {
      const { favoritesApi } = await import('@/lib/api')
      await favoritesApi.removeCard(folderId, cardId)
    }
    const favorites = get().favorites.map(f => {
      if (f.id === folderId) {
        return { ...f, cardIds: f.cardIds.filter(id => id !== cardId) }
      }
      return f
    })
    set({ favorites })
    if (!USE_API) storage.set(STORAGE_KEYS.FAVORITES, favorites)
  },

  isCardFavorited: (cardId) => {
    return get().favorites.some(f => f.cardIds.includes(cardId))
  },

  updateCategoryOrder: (order) => {
    const settings = { ...get().settings, categoryOrder: order }
    set({ settings })
    storage.set(STORAGE_KEYS.SETTINGS, settings)
    if (USE_API) {
      import('@/lib/api').then(({ settingsApi }) => settingsApi.update({ categoryOrder: order }))
    }
  },

  setSelectedCategories: (categories) => {
    const settings = { ...get().settings, selectedCategories: categories }
    set({ settings })
    storage.set(STORAGE_KEYS.SETTINGS, settings)
    if (USE_API) {
      import('@/lib/api').then(({ settingsApi }) => settingsApi.update({ selectedCategories: categories }))
    }
  },

  triggerFavoriteAnimation: () => {
    set({ isFavoriting: true })
    setTimeout(() => set({ isFavoriting: false }), 500)
  },
}))
