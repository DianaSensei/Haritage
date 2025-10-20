import { create } from 'zustand';
import { FeedItem } from '@/shared/types';

interface FeedState {
  items: FeedItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  refreshing: boolean;
}

interface FeedActions {
  setItems: (items: FeedItem[]) => void;
  addItems: (items: FeedItem[]) => void;
  updateItem: (id: string, updates: Partial<FeedItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setRefreshing: (refreshing: boolean) => void;
  refreshFeed: () => void;
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

  // Actions
  setItems: (items) => set({ items }),
  
  addItems: (newItems) => {
    const currentItems = get().items;
    const existingIds = new Set(currentItems.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    set({ items: [...currentItems, ...uniqueNewItems] });
  },
  
  updateItem: (id, updates) => {
    const items = get().items;
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    set({ items: updatedItems });
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
  
  refreshFeed: () => {
    set({ 
      items: [], 
      currentPage: 1, 
      hasMore: true, 
      refreshing: true,
      error: null 
    });
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
