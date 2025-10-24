import { http } from '@/shared/services/api/client';
import { User, ApiResponse } from '@/shared/types';

export interface UpdateProfileParams {
  name?: string;
  email?: string;
  avatar?: string;
}

export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Update user profile
  async updateProfile(userId: number, updates: UpdateProfileParams): Promise<ApiResponse<User>> {
    try {
      const data = await http.patch<ApiResponse<User>>(
        `/users/${userId}`,
        updates
      );
      return data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return {
        data: null as unknown as User,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // Update user avatar specifically
  async updateAvatar(userId: number, avatarUrl: string): Promise<ApiResponse<User>> {
    return this.updateProfile(userId, { avatar: avatarUrl });
  }

  // Get user profile
  async getProfile(userId: number): Promise<ApiResponse<User>> {
    try {
      const data = await http.get<ApiResponse<User>>(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return {
        data: null as unknown as User,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }
}

export const userService = UserService.getInstance();
