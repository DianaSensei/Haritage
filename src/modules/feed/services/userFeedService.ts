/**
 * User Feed Management Service
 * Handles operations for editing, hiding, and deleting user's own feed posts
 */

import { mockStore } from '@/shared/data/stores/mockDataStore';
import { FeedItem } from '@/shared/types';
import { mockUserFeedItems, MOCK_CURRENT_USER_ID } from '../data/mockUserFeedData';

export interface EditFeedItemParams {
  id: string;
  title?: string;
  content?: string;
  mediaUris?: string[];
  videoUrl?: string;
  url?: string;
  urlPreview?: FeedItem['urlPreview'];
  poll?: FeedItem['poll'];
}

class UserFeedService {
  /**
   * Get all feed items created by the current user
   */
  async getUserFeedItems(includeHidden = false): Promise<FeedItem[]> {
    await mockStore.initialize();
    
    const allItems = mockStore.getFeedItems();
    const userItems = allItems.filter(item => item.author.id === MOCK_CURRENT_USER_ID);
    
    // If we have no user items in store, seed with mock data
    if (userItems.length === 0) {
      for (const item of mockUserFeedItems) {
        mockStore.addFeedItem(item);
      }
      await mockStore.save();
      return includeHidden 
        ? mockUserFeedItems 
        : mockUserFeedItems.filter(item => !item.isHidden);
    }
    
    return includeHidden 
      ? userItems 
      : userItems.filter(item => !item.isHidden);
  }

  /**
   * Get a single feed item by ID (only if it belongs to current user)
   */
  async getUserFeedItem(id: string): Promise<FeedItem | null> {
    await mockStore.initialize();
    
    const item = mockStore.getFeedItemById(id);
    if (!item || item.author.id !== MOCK_CURRENT_USER_ID) {
      return null;
    }
    
    return item;
  }

  /**
   * Edit a feed item
   */
  async editFeedItem(params: EditFeedItemParams): Promise<FeedItem | null> {
    await mockStore.initialize();
    
    const item = mockStore.getFeedItemById(params.id);
    if (!item || item.author.id !== MOCK_CURRENT_USER_ID) {
      throw new Error('Feed item not found or you do not have permission to edit it');
    }

    const updates: Partial<FeedItem> = {
      updatedAt: new Date(),
    };

    if (params.title !== undefined) updates.title = params.title;
    if (params.content !== undefined) updates.content = params.content;
    if (params.mediaUris !== undefined) updates.mediaUris = params.mediaUris;
    if (params.videoUrl !== undefined) updates.videoUrl = params.videoUrl;
    if (params.url !== undefined) updates.url = params.url;
    if (params.urlPreview !== undefined) updates.urlPreview = params.urlPreview;
    if (params.poll !== undefined) updates.poll = params.poll;

    const updated = mockStore.updateFeedItem(params.id, updates);
    await mockStore.save();
    
    return updated || null;
  }

  /**
   * Hide a feed item (soft delete - hidden from public but visible to user)
   */
  async hideFeedItem(id: string): Promise<boolean> {
    await mockStore.initialize();
    
    const item = mockStore.getFeedItemById(id);
    if (!item || item.author.id !== MOCK_CURRENT_USER_ID) {
      throw new Error('Feed item not found or you do not have permission to hide it');
    }

    mockStore.updateFeedItem(id, { isHidden: true, updatedAt: new Date() });
    await mockStore.save();
    
    return true;
  }

  /**
   * Unhide a feed item
   */
  async unhideFeedItem(id: string): Promise<boolean> {
    await mockStore.initialize();
    
    const item = mockStore.getFeedItemById(id);
    if (!item || item.author.id !== MOCK_CURRENT_USER_ID) {
      throw new Error('Feed item not found or you do not have permission to unhide it');
    }

    mockStore.updateFeedItem(id, { isHidden: false, updatedAt: new Date() });
    await mockStore.save();
    
    return true;
  }

  /**
   * Delete a feed item permanently
   */
  async deleteFeedItem(id: string): Promise<boolean> {
    await mockStore.initialize();
    
    const item = mockStore.getFeedItemById(id);
    if (!item || item.author.id !== MOCK_CURRENT_USER_ID) {
      throw new Error('Feed item not found or you do not have permission to delete it');
    }

    const deleted = mockStore.deleteFeedItem(id);
    if (deleted) {
      await mockStore.save();
    }
    
    return deleted;
  }

  /**
   * Get feed statistics for the current user
   */
  async getUserFeedStats(): Promise<{
    totalPosts: number;
    hiddenPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  }> {
    const items = await this.getUserFeedItems(true);
    
    return {
      totalPosts: items.length,
      hiddenPosts: items.filter(item => item.isHidden).length,
      totalLikes: items.reduce((sum, item) => sum + item.likes, 0),
      totalComments: items.reduce((sum, item) => sum + item.comments, 0),
      totalShares: items.reduce((sum, item) => sum + item.shares, 0),
    };
  }
}

export const userFeedService = new UserFeedService();
