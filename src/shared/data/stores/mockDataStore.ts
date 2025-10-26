/**
 * Mock Data Store
 * In-memory storage for development/testing without backend
 * Data persists in memory and can be saved/loaded from async storage
 */

import { FeedItem, Notification, User } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MockDataStore {
  users: User[];
  feedItems: FeedItem[];
  notifications: Notification[];
  currentUserId?: string;
}

const STORAGE_KEY = 'haritage_mock_data_store';

// Default mock data
const DEFAULT_MOCK_DATA: MockDataStore = {
  users: [
    {
      id: 'user1',
      phoneNumber: '+1234567890',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
      email: 'sarah@example.com',
      isBiometricEnabled: false,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'user2',
      phoneNumber: '+1987654321',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=200&q=60',
      email: 'mike@example.com',
      isBiometricEnabled: true,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
    },
  ],
  feedItems: [
    {
      id: '1',
      type: 'image',
      title: 'Golden Hour Over the Coast',
      content: 'The sky exploded with color tonight—definitely worth the detour after work. Captured a few frames before the light faded.',
      mediaUris: [
        'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      ],
      author: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
      },
      likes: 245,
      downvotes: 12,
      comments: 28,
      shares: 15,
      isLiked: false,
      isSaved: true,
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
  notifications: [
    {
      id: 'notif1',
      title: 'Welcome to Haritage!',
      message: 'Explore amazing posts from the community',
      type: 'success',
      isRead: false,
      createdAt: new Date(),
    },
  ],
  currentUserId: 'user1',
};

class MockStore {
  private data: MockDataStore = { ...DEFAULT_MOCK_DATA };
  private initialized = false;

  /**
   * Initialize mock store from async storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        // Save default data on first initialization
        await this.save();
      }
    } catch (error) {
      console.error('Error initializing mock store:', error);
      // Fall back to default data
    }

    this.initialized = true;
  }

  /**
   * Save current store to async storage
   */
  async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving mock store:', error);
      throw error;
    }
  }

  /**
   * Get all data
   */
  getData(): MockDataStore {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Reset to default data
   */
  async reset(): Promise<void> {
    this.data = JSON.parse(JSON.stringify(DEFAULT_MOCK_DATA));
    await this.save();
  }

  /**
   * User operations
   */
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getCurrentUser(): User | undefined {
    if (!this.data.currentUserId) return undefined;
    return this.getUserById(this.data.currentUserId);
  }

  addUser(user: User): void {
    this.data.users.push(user);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.data.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.data.users.splice(index, 1);
    return true;
  }

  setCurrentUser(userId: string): void {
    this.data.currentUserId = userId;
  }

  /**
   * Feed operations
   */
  getFeedItems(): FeedItem[] {
    return this.data.feedItems;
  }

  getFeedItemById(id: string): FeedItem | undefined {
    return this.data.feedItems.find((f) => f.id === id);
  }

  addFeedItem(item: FeedItem): void {
    this.data.feedItems.unshift(item);
  }

  updateFeedItem(id: string, updates: Partial<FeedItem>): FeedItem | undefined {
    const index = this.data.feedItems.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    this.data.feedItems[index] = {
      ...this.data.feedItems[index],
      ...updates,
    };
    return this.data.feedItems[index];
  }

  deleteFeedItem(id: string): boolean {
    const index = this.data.feedItems.findIndex((f) => f.id === id);
    if (index === -1) return false;

    this.data.feedItems.splice(index, 1);
    return true;
  }

  /**
   * Notification operations
   */
  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  getNotificationById(id: string): Notification | undefined {
    return this.data.notifications.find((n) => n.id === id);
  }

  addNotification(notification: Notification): void {
    this.data.notifications.unshift(notification);
  }

  updateNotification(id: string, updates: Partial<Notification>): Notification | undefined {
    const index = this.data.notifications.findIndex((n) => n.id === id);
    if (index === -1) return undefined;

    this.data.notifications[index] = {
      ...this.data.notifications[index],
      ...updates,
    };
    return this.data.notifications[index];
  }

  deleteNotification(id: string): boolean {
    const index = this.data.notifications.findIndex((n) => n.id === id);
    if (index === -1) return false;

    this.data.notifications.splice(index, 1);
    return true;
  }
}

// Singleton instance
export const mockStore = new MockStore();
