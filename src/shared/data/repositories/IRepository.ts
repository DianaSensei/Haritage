/**
 * Repository Interface
 * Defines the contract for all data operations
 * Implementations can be API-based, mock-based, or hybrid
 */

import {
    FeedItem,
    Notification,
    PaginatedResponse,
    PaginationParams,
    User,
} from '@/shared/types';

/**
 * Repository Result Type
 * Standardized response format for all data operations
 */
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Repository Query Options
 * Common query parameters for filtering, sorting, pagination
 */
export interface QueryOptions extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

/**
 * User Repository
 * Handles all user-related data operations
 */
export interface IUserRepository {
  // Read operations
  getUserById(id: string): Promise<RepositoryResult<User>>;
  getCurrentUser(): Promise<RepositoryResult<User>>;
  getUsers(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<User>>>;

  // Write operations
  createUser(userData: Partial<User>): Promise<RepositoryResult<User>>;
  updateUser(id: string, userData: Partial<User>): Promise<RepositoryResult<User>>;
  deleteUser(id: string): Promise<RepositoryResult<void>>;

  // Auth operations
  loginWithPhone(phoneNumber: string): Promise<RepositoryResult<User>>;
  verifyOTP(phoneNumber: string, otp: string): Promise<RepositoryResult<User>>;
  logout(): Promise<RepositoryResult<void>>;
}

/**
 * Feed Repository
 * Handles all feed/post-related data operations
 */
export interface IFeedRepository {
  // Read operations
  getFeedItems(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;
  getFeedItemById(id: string): Promise<RepositoryResult<FeedItem>>;
  getUserFeedItems(userId: string, options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;
  getTrendingFeedItems(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;

  // Write operations
  createFeedItem(item: Omit<FeedItem, 'id' | 'createdAt'>): Promise<RepositoryResult<FeedItem>>;
  updateFeedItem(id: string, item: Partial<FeedItem>): Promise<RepositoryResult<FeedItem>>;
  deleteFeedItem(id: string): Promise<RepositoryResult<void>>;

  // Interaction operations
  likeFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  unlikeFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  saveFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  unsaveFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
}

/**
 * Notification Repository
 * Handles all notification-related data operations
 */
export interface INotificationRepository {
  // Read operations
  getNotifications(options?: QueryOptions): Promise<RepositoryResult<PaginatedResponse<Notification>>>;
  getUnreadNotifications(): Promise<RepositoryResult<Notification[]>>;
  getNotificationById(id: string): Promise<RepositoryResult<Notification>>;

  // Write operations
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<RepositoryResult<Notification>>;
  markNotificationAsRead(id: string): Promise<RepositoryResult<Notification>>;
  markAllNotificationsAsRead(): Promise<RepositoryResult<void>>;
  deleteNotification(id: string): Promise<RepositoryResult<void>>;
}

/**
 * Data Repository Factory
 * Aggregates all repositories for easy access
 */
export interface IDataRepository {
  user: IUserRepository;
  feed: IFeedRepository;
  notification: INotificationRepository;
}
