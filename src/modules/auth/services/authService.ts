import { CONFIG } from '@/core/config';
import { ApiError, http } from '@/shared/services/api/client';
import { ApiErrorHandler } from '@/shared/services/api/errorHandler';
import { ApiResponse, User } from '@/shared/types';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // TODO : Remove mock sessionId when backend is ready
  // Phone OTP Authentication
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ sessionId: string }>> {
    // try {
      // const data = await http.post<ApiResponse<{ sessionId: string }>>(
      //   '/auth/send-otp',
      //   { phoneNumber },
      //   { timeoutMs: CONFIG.NETWORK.TIMEOUT_MS }
      // );
      return { data: { sessionId: 'mock-session-id' }, success: true };
    // } catch (error) {
    //   const apiError = error as ApiError;
    //   const errorInfo = ApiErrorHandler.handleError(apiError);

    //   return {
    //     data: { sessionId: '' },
    //     success: false,
    //     error: errorInfo.message,
    //   };
    // }
  }

    // TODO : Remove mock otp when backend is ready
  async verifyOTP(phoneNumber: string, otp: string, sessionId: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // const data = await http.post<ApiResponse<{ user: User; token: string }>>(
      //   '/auth/verify-otp',
      //   { phoneNumber, otp, sessionId },
      //   { timeoutMs: CONFIG.NETWORK.TIMEOUT_MS }
      // );
      if (otp !== '000000') {
        return {
          data: { user: {} as User, token: '' },
          success: false,
          error: 'Invalid OTP',
        };
      }

      const data: ApiResponse<{ user: User; token: string }> = {
        data: {
          user: {
            id: 1,
            phoneNumber,
            name: 'Nguyễn Đức Thông',
            avatar: '',
            isBiometricEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          token: 'mock-jwt-token',
        },
        success: true,
      };
      await this.storeToken(data.data.token);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      const errorInfo = ApiErrorHandler.handleError(apiError);

      return {
        data: { user: {} as User, token: '' },
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Biometric Authentication
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch {
      return false;
    }
  }

  async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available');
      }

      const isAuthenticated = await this.authenticateWithBiometric();
      if (isAuthenticated) {
        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED);
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  }

  // Token Management
  async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.USER_TOKEN);
    } catch {
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  // User Management
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const data = await http.get<ApiResponse<User>>('/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
      });
      return data.data;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        // await http.post('/auth/logout', undefined, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        //   timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
        // });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeToken();
      // Clean up PIN and biometric settings on logout
      const { pinService } = await import('./pinService');
      await pinService.removePin();
      await this.disableBiometric();
    }
  }
}

export const authService = AuthService.getInstance();
