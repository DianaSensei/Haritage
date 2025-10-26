import { CONFIG } from '@/core/config';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { authService } from '@/modules/auth/services/authService';
import { ApiError, http } from '@/shared/services/api/client';
import { ApiErrorHandler } from '@/shared/services/api/errorHandler';
import { ApiResponse, User } from '@/shared/types';

type UploadAvatarResponse = {
  avatarUrl: string;
};

type ProfileUpdates = Partial<Pick<User, 'name' | 'email'>> & {
  bio?: string;
  location?: string;
};

class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private shouldMockResponses(): boolean {
    return CONFIG.API_BASE_URL.includes('haritage.com');
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
    };
  }

  private async withAuthHeaders() {
    const token = await authService.getToken();
    if (!token) {
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
    } as Record<string, string>;
  }

  private async simulateNetworkLatency(delay = 600) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const state = useAuthStore.getState();
    const fallbackUser = state.user;

    try {
      const headers = await this.withAuthHeaders();
      if (!headers) {
        throw new Error('Authentication required');
      }

      if (this.shouldMockResponses()) {
        await this.simulateNetworkLatency(300);
        if (!fallbackUser) {
          throw new Error('No cached user available');
        }
        return {
          data: fallbackUser,
          success: true,
          message: 'Using cached profile (mock environment)',
        };
      }

      const response = await http.get<ApiResponse<User>>('/users/me', {
        headers,
        timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
      });

      return {
        ...response,
        data: this.normalizeUser(response.data),
      };
    } catch (error) {
      const apiError = error as ApiError;
      const { message } = ApiErrorHandler.handleError(apiError);

      return {
        data: fallbackUser ?? ({} as User),
        success: false,
        error: message,
      };
    }
  }

  async updateProfile(updates: ProfileUpdates): Promise<ApiResponse<User>> {
    const state = useAuthStore.getState();
    const fallbackUser = state.user;

    try {
      const headers = await this.withAuthHeaders();
      if (!headers) {
        throw new Error('Authentication required');
      }

      if (this.shouldMockResponses()) {
        await this.simulateNetworkLatency(450);
        if (!fallbackUser) {
          throw new Error('No cached user available');
        }
        const mergedUser: User = this.normalizeUser({
          ...fallbackUser,
          ...updates,
          updatedAt: new Date(),
        });
        return {
          data: mergedUser,
          success: true,
          message: 'Profile updated locally (mock environment)',
        };
      }

      const response = await http.patch<ApiResponse<User>>('/users/me', updates, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
      });

      return {
        ...response,
        data: this.normalizeUser(response.data),
      };
    } catch (error) {
      const apiError = error as ApiError;
      const { message } = ApiErrorHandler.handleError(apiError);

      return {
        data: fallbackUser ?? ({} as User),
        success: false,
        error: message,
      };
    }
  }

  async uploadAvatar(fileUri: string): Promise<ApiResponse<UploadAvatarResponse>> {
    try {
      const headers = await this.withAuthHeaders();
      if (!headers) {
        throw new Error('Authentication required');
      }

      if (this.shouldMockResponses()) {
        await this.simulateNetworkLatency(600);
        return {
          data: { avatarUrl: fileUri },
          success: true,
          message: 'Avatar updated locally (mock environment)',
        };
      }

      const extension = fileUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `avatar-${Date.now()}.${extension}`;

      const response = await http.postForm<ApiResponse<UploadAvatarResponse>>(
        '/users/me/avatar',
        {
          files: {
            avatar: {
              uri: fileUri,
              name: fileName,
              type: mimeType,
            },
          },
        },
        {
          headers,
          timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
        }
      );

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      const { message } = ApiErrorHandler.handleError(apiError);

      return {
        data: { avatarUrl: fileUri },
        success: false,
        error: message,
      };
    }
  }
}

export const userService = UserService.getInstance();
