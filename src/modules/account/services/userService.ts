import { FileUpload, http } from '@/shared/services/api/client';
import { ApiResponse, User } from '@/shared/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Upload/update avatar
  async uploadAvatar(avatarFile: FileUpload): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const result = await http.postForm<ApiResponse<{ avatarUrl: string }>>(
        '/users/avatar',
        {
          files: {
            avatar: avatarFile,
          },
        },
        {
          timeoutMs: 30000, // 30 seconds for avatar upload
        }
      );
      return result;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      return {
        data: { avatarUrl: '' },
        success: false,
        error: error?.message || 'Failed to upload avatar',
      };
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const result = await http.patch<ApiResponse<User>>('/users/profile', data, {
        timeoutMs: 15000,
      });
      return result;
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        data: {} as User,
        success: false,
        error: error?.message || 'Failed to update profile',
      };
    }
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const result = await http.get<ApiResponse<User>>('/users/profile', {
        timeoutMs: 15000,
      });
      return result;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        data: {} as User,
        success: false,
        error: error?.message || 'Failed to get profile',
      };
    }
  }
}

export const userService = UserService.getInstance();
