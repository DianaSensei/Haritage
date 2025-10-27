import { feedStorageService } from '@/shared/services/storage/feedStorageService';
import { FeedItem } from '@/shared/types';
import { create } from 'zustand';

interface FeedState {
  items: FeedItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  refreshing: boolean;
  filters: {
    search: string;
    tags: string[];
    dateRange: 'all' | '24h' | '7d' | '30d';
  };
}

interface FeedActions {
  setItems: (items: FeedItem[]) => void;
  addItems: (items: FeedItem[]) => void;
  prependItem: (item: FeedItem) => void;
  updateItem: (id: string, updates: Partial<FeedItem>) => void;
  updateAuthorAvatar: (authorId: string, avatarUrl: string) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setRefreshing: (refreshing: boolean) => void;
  setFilters: (filters: { search?: string; tags?: string[]; dateRange?: 'all' | '24h' | '7d' | '30d' }) => void;
  refreshFeed: () => Promise<void>;
  loadMore: () => void;
  clearFeed: () => void;
}

type FeedStore = FeedState & FeedActions;

export const useFeedStore = create<FeedStore>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  refreshing: false,
  filters: {
    search: '',
    tags: [],
    dateRange: 'all',
  },

  // Actions
  setItems: (items) => set({ items }),
  
  addItems: (newItems) => {
    const currentItems = get().items;
    const existingIds = new Set(currentItems.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    set({ items: [...currentItems, ...uniqueNewItems] });
  },

  prependItem: (item) => {
    const currentItems = get().items;
    const filtered = currentItems.filter(existing => existing.id !== item.id);
    set({ items: [item, ...filtered] });
  },
  
  updateItem: (id, updates) => {
    const items = get().items;
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    set({ items: updatedItems });
  },

  updateAuthorAvatar: (authorId, avatarUrl) => {
    const items = get().items;
    let didChange = false;

    const updatedItems = items.map((item) => {
      if (item.author.id === authorId) {
        didChange = true;
        return {
          ...item,
          author: {
            ...item.author,
            avatar: avatarUrl,
          },
        };
      }
      return item;
    });

    if (!didChange) {
      return;
    }

    set({ items: updatedItems });

    feedStorageService.saveFeedItems(updatedItems).catch((error) => {
      console.warn('Failed to persist avatar update in feed storage', error);
    });
  },
  
  removeItem: (id) => {
    const items = get().items;
    set({ items: items.filter(item => item.id !== id) });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  setRefreshing: (refreshing) => set({ refreshing }),
  setFilters: (newFilters) => {
    const current = get().filters;
    set({ filters: { ...current, ...newFilters } });
  },
  
  refreshFeed: async () => {
    const previousItems = get().items;
    set({ refreshing: true, error: null });

    try {
      const items = await feedStorageService.ensureFeedItems();
      set({
        items: items.length > 0 ? items : previousItems,
        currentPage: 1,
        hasMore: true,
        refreshing: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to refresh feed', error);
      set({
        items: previousItems,
        refreshing: false,
        error: 'Unable to refresh feed right now.',
      });
    }
  },
  
  loadMore: () => {
    const { currentPage, hasMore, isLoading } = get();
    if (hasMore && !isLoading) {
      set({ currentPage: currentPage + 1 });
    }
  },
  
  clearFeed: () => set({ 
    items: [], 
    currentPage: 1, 
    hasMore: true, 
    error: null 
  }),
}));
