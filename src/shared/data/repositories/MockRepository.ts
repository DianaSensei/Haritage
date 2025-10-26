/**
 * Mock Repository Implementations
 * Provides data operations using mock data store
 * Perfect for development without backend API
 */

import {
    IDataRepository,
    IFeedRepository,
    INotificationRepository,
    IUserRepository,
    QueryOptions,
    RepositoryResult,
} from '@/shared/data/repositories/IRepository';
import { mockStore } from '@/shared/data/stores/mockDataStore';
import { FeedItem, Notification, PaginatedResponse, User } from '@/shared/types';

/**
 * Mock User Repository
 */
export class MockUserRepository implements IUserRepository {
  async getUserById(id: string): Promise<RepositoryResult<User>> {
    try {
      const user = mockStore.getUserById(id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getCurrentUser(): Promise<RepositoryResult<User>> {
    try {
      const user = mockStore.getCurrentUser();
      if (!user) {
        return { success: false, error: 'No current user' };
      }
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getUsers(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<User>>> {
    try {
      let users = mockStore.getUsers();

      // Apply search filter
      if (options?.search) {
        users = users.filter((u) =>
          u.name?.toLowerCase().includes(options.search!.toLowerCase())
        );
      }

      // Apply pagination
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const start = (page - 1) * limit;
      const data = users.slice(start, start + limit);

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total: users.length,
            totalPages: Math.ceil(users.length / limit),
          },
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createUser(userData: Partial<User>): Promise<RepositoryResult<User>> {
    try {
      const newUser: User = {
        id: `user_${Date.now()}`,
        phoneNumber: userData.phoneNumber || '',
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        isBiometricEnabled: userData.isBiometricEnabled || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.addUser(newUser);
      await mockStore.save();

      return { success: true, data: newUser };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<RepositoryResult<User>> {
    try {
      const updated = mockStore.updateUser(id, userData);
      if (!updated) {
        return { success: false, error: 'User not found' };
      }

      await mockStore.save();
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteUser(id: string): Promise<RepositoryResult<void>> {
    try {
      const deleted = mockStore.deleteUser(id);
      if (!deleted) {
        return { success: false, error: 'User not found' };
      }

      await mockStore.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async loginWithPhone(phoneNumber: string): Promise<RepositoryResult<User>> {
    try {
      // In mock, just find or create user
      let user = mockStore.getUsers().find((u) => u.phoneNumber === phoneNumber);

      if (!user) {
        const result = await this.createUser({ phoneNumber });
        if (!result.success || !result.data) {
          return { success: false, error: 'Failed to create user' };
        }
        user = result.data;
      }

      mockStore.setCurrentUser(user.id);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<RepositoryResult<User>> {
    try {
      // In mock, OTP verification always succeeds
      let user = mockStore.getUsers().find((u) => u.phoneNumber === phoneNumber);

      if (!user) {
        const result = await this.createUser({ phoneNumber });
        if (!result.success || !result.data) {
          return { success: false, error: 'Failed to create user' };
        }
        user = result.data;
      }

      mockStore.setCurrentUser(user.id);
      await mockStore.save();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async logout(): Promise<RepositoryResult<void>> {
    try {
      mockStore.setCurrentUser('');
      await mockStore.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

/**
 * Mock Feed Repository
 */
export class MockFeedRepository implements IFeedRepository {
  async getFeedItems(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>> {
    try {
      let items = mockStore.getFeedItems();

      // Apply search filter
      if (options?.search) {
        items = items.filter((i) =>
          i.title?.toLowerCase().includes(options.search!.toLowerCase()) ||
          i.content.toLowerCase().includes(options.search!.toLowerCase())
        );
      }

      // Apply sorting
      if (options?.sortBy === 'likes') {
        items.sort((a, b) => (options.sortOrder === 'desc' ? b.likes - a.likes : a.likes - b.likes));
      } else {
        items.sort((a, b) => (options?.sortOrder === 'desc' ? b.createdAt.getTime() - a.createdAt.getTime() : a.createdAt.getTime() - b.createdAt.getTime()));
      }

      // Apply pagination
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const start = (page - 1) * limit;
      const data = items.slice(start, start + limit);

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total: items.length,
            totalPages: Math.ceil(items.length / limit),
          },
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getFeedItemById(id: string): Promise<RepositoryResult<FeedItem>> {
    try {
      const item = mockStore.getFeedItemById(id);
      if (!item) {
        return { success: false, error: 'Feed item not found' };
      }
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getUserFeedItems(userId: string, options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>> {
    try {
      let items = mockStore.getFeedItems().filter((i) => i.author.id === userId);

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const start = (page - 1) * limit;
      const data = items.slice(start, start + limit);

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total: items.length,
            totalPages: Math.ceil(items.length / limit),
          },
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getTrendingFeedItems(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>> {
    try {
      let items = [...mockStore.getFeedItems()].sort((a, b) => b.likes - a.likes);

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const start = (page - 1) * limit;
      const data = items.slice(start, start + limit);

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total: items.length,
            totalPages: Math.ceil(items.length / limit),
          },
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createFeedItem(item: Omit<FeedItem, 'id' | 'createdAt'>): Promise<RepositoryResult<FeedItem>> {
    try {
      const newItem: FeedItem = {
        ...item,
        id: `feed_${Date.now()}`,
        createdAt: new Date(),
      };

      mockStore.addFeedItem(newItem);
      await mockStore.save();
      return { success: true, data: newItem };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateFeedItem(id: string, item: Partial<FeedItem>): Promise<RepositoryResult<FeedItem>> {
    try {
      const updated = mockStore.updateFeedItem(id, item);
      if (!updated) {
        return { success: false, error: 'Feed item not found' };
      }

      await mockStore.save();
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteFeedItem(id: string): Promise<RepositoryResult<void>> {
    try {
      const deleted = mockStore.deleteFeedItem(id);
      if (!deleted) {
        return { success: false, error: 'Feed item not found' };
      }

      await mockStore.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async likeFeedItem(id: string): Promise<RepositoryResult<FeedItem>> {
    try {
      const item = mockStore.getFeedItemById(id);
      if (!item) {
        return { success: false, error: 'Feed item not found' };
      }

      const updated = mockStore.updateFeedItem(id, {
        likes: item.isLiked ? item.likes - 1 : item.likes + 1,
        isLiked: !item.isLiked,
      });

      await mockStore.save();
      return { success: true, data: updated! };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async unlikeFeedItem(id: string): Promise<RepositoryResult<FeedItem>> {
    return this.likeFeedItem(id);
  }

  async saveFeedItem(id: string): Promise<RepositoryResult<FeedItem>> {
    try {
      const item = mockStore.getFeedItemById(id);
      if (!item) {
        return { success: false, error: 'Feed item not found' };
      }

      const updated = mockStore.updateFeedItem(id, {
        isSaved: !item.isSaved,
      });

      await mockStore.save();
      return { success: true, data: updated! };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async unsaveFeedItem(id: string): Promise<RepositoryResult<FeedItem>> {
    return this.saveFeedItem(id);
  }
}

/**
 * Mock Notification Repository
 */
export class MockNotificationRepository implements INotificationRepository {
  async getNotifications(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<Notification>>> {
    try {
      let notifications = mockStore.getNotifications();

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const start = (page - 1) * limit;
      const data = notifications.slice(start, start + limit);

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total: notifications.length,
            totalPages: Math.ceil(notifications.length / limit),
          },
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getUnreadNotifications(): Promise<RepositoryResult<Notification[]>> {
    try {
      const notifications = mockStore.getNotifications().filter((n) => !n.isRead);
      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getNotificationById(id: string): Promise<RepositoryResult<Notification>> {
    try {
      const notification = mockStore.getNotificationById(id);
      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }
      return { success: true, data: notification };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<RepositoryResult<Notification>> {
    try {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}`,
        createdAt: new Date(),
      };

      mockStore.addNotification(newNotification);
      await mockStore.save();
      return { success: true, data: newNotification };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async markNotificationAsRead(id: string): Promise<RepositoryResult<Notification>> {
    try {
      const updated = mockStore.updateNotification(id, { isRead: true });
      if (!updated) {
        return { success: false, error: 'Notification not found' };
      }

      await mockStore.save();
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async markAllNotificationsAsRead(): Promise<RepositoryResult<void>> {
    try {
      const notifications = mockStore.getNotifications();
      notifications.forEach((n) => {
        mockStore.updateNotification(n.id, { isRead: true });
      });

      await mockStore.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteNotification(id: string): Promise<RepositoryResult<void>> {
    try {
      const deleted = mockStore.deleteNotification(id);
      if (!deleted) {
        return { success: false, error: 'Notification not found' };
      }

      await mockStore.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

/**
 * Mock Data Repository (Aggregator)
 */
export class MockDataRepository implements IDataRepository {
  user: IUserRepository;
  feed: IFeedRepository;
  notification: INotificationRepository;

  constructor() {
    this.user = new MockUserRepository();
    this.feed = new MockFeedRepository();
    this.notification = new MockNotificationRepository();
  }
}
