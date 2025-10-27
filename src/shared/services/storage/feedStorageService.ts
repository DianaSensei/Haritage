import { buildDefaultFeedItems } from '@/shared/data/feed/defaultFeedItems';
import { FeedItem } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FEED_STORAGE_KEY = '@haritage_feed_items';
const FEED_VERSION_KEY = '@haritage_feed_version';

interface StorageData {
  version: number;
  items: FeedItem[];
  lastUpdated: string;
}

const sanitizeFeedItem = (item: FeedItem): FeedItem => {
  const cleanedMediaUris = (item.mediaUris ?? [])
    .map((uri) => (typeof uri === 'string' ? uri.trim() : ''))
    .filter((uri): uri is string => uri.length > 0);

  const cleanedVideoUrl = typeof item.videoUrl === 'string' ? item.videoUrl.trim() : undefined;
  const cleanedThumbnail = typeof item.thumbnail === 'string' ? item.thumbnail.trim() : undefined;
  const cleanedAuthorAvatar =
    typeof item.author?.avatar === 'string' ? item.author.avatar.trim() : item.author?.avatar;

  return {
    ...item,
    mediaUris: cleanedMediaUris,
    videoUrl: cleanedVideoUrl && cleanedVideoUrl.length > 0 ? cleanedVideoUrl : undefined,
    thumbnail: cleanedThumbnail && cleanedThumbnail.length > 0 ? cleanedThumbnail : undefined,
    author: {
      ...item.author,
      avatar: cleanedAuthorAvatar && cleanedAuthorAvatar.length > 0 ? cleanedAuthorAvatar : '',
    },
  };
};

const sanitizeFeedItems = (items: FeedItem[]): FeedItem[] =>
  items.map((item) => sanitizeFeedItem(item));

/**
 * Feed Storage Service
 * Handles persistence of feed items to local device storage
 * Provides layer for easy API integration in the future
 */
export const feedStorageService = {
  /**
   * Save feed items to local storage
   */
  async saveFeedItems(items: FeedItem[]): Promise<void> {
    try {
      const data: StorageData = {
        version: 1,
        items: sanitizeFeedItems(items),
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving feed items:', error);
      throw error;
    }
  },

  /**
   * Load feed items from local storage
   */
  async getFeedItems(): Promise<FeedItem[] | null> {
    try {
      const data = await AsyncStorage.getItem(FEED_STORAGE_KEY);
      if (!data) {
        return null;
      }

      const parsedData: StorageData = JSON.parse(data);

      const items = sanitizeFeedItems(parsedData.items).map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : item.updatedAt,
      }));

      return items;
    } catch (error) {
      console.error('Error loading feed items:', error);
      return null;
    }
  },

  /**
   * Clear all feed items from storage
   */
  async clearFeedItems(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FEED_STORAGE_KEY);
      await AsyncStorage.removeItem(FEED_VERSION_KEY);
    } catch (error) {
      console.error('Error clearing feed items:', error);
      throw error;
    }
  },

  /**
   * Add a single feed item to storage
   */
  async addFeedItem(item: FeedItem): Promise<void> {
    try {
      const existingItems = await this.getFeedItems();
  const items = existingItems ? [sanitizeFeedItem(item), ...existingItems] : [sanitizeFeedItem(item)];
      await this.saveFeedItems(items);
    } catch (error) {
      console.error('Error adding feed item:', error);
      throw error;
    }
  },

  /**
   * Delete a feed item from storage
   */
  async deleteFeedItem(itemId: string): Promise<void> {
    try {
      const items = await this.getFeedItems();
      if (!items) return;

      const filtered = items.filter((item) => item.id !== itemId);
      await this.saveFeedItems(filtered);
    } catch (error) {
      console.error('Error deleting feed item:', error);
      throw error;
    }
  },

  /**
   * Update a feed item in storage
   */
  async updateFeedItem(itemId: string, updates: Partial<FeedItem>): Promise<void> {
    try {
      const items = await this.getFeedItems();
      if (!items) return;

      const updated = items.map((item) =>
        item.id === itemId ? sanitizeFeedItem({ ...item, ...updates }) : item
      );
      await this.saveFeedItems(updated);
    } catch (error) {
      console.error('Error updating feed item:', error);
      throw error;
    }
  },

  /**
   * Get storage info (for debugging/analytics)
   */
  async getStorageInfo(): Promise<{ itemCount: number; lastUpdated: string | null }> {
    try {
      const data = await AsyncStorage.getItem(FEED_STORAGE_KEY);
      if (!data) {
        return { itemCount: 0, lastUpdated: null };
      }

      const parsedData: StorageData = JSON.parse(data);
      return {
        itemCount: parsedData.items.length,
        lastUpdated: parsedData.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { itemCount: 0, lastUpdated: null };
    }
  },

  /**
   * Ensure feed items exist in storage by seeding defaults when empty.
   */
  async ensureFeedItems(): Promise<FeedItem[]> {
    const existing = await this.getFeedItems();
    if (existing && existing.length > 0) {
      return existing;
    }

    const defaults = buildDefaultFeedItems();
    await this.saveFeedItems(defaults);

    const seeded = await this.getFeedItems();
    if (seeded && seeded.length > 0) {
      return seeded;
    }

    return sanitizeFeedItems(defaults);
  },
};

export default feedStorageService;
