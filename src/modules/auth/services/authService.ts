import { CONFIG } from '@/core/config';
import { http } from '@/shared/services/api/client';
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

  // Phone OTP Authentication
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ sessionId: string }>> {
    try {
      // In a real app, this would call your backend API
      const data = await http.post<ApiResponse<{ sessionId: string }>>(
        '/auth/send-otp',
        { phoneNumber },
        { timeoutMs: CONFIG.NETWORK.TIMEOUT_MS }
      );
      return data;
    } catch (error) {
      return {
        data: { sessionId: '' },
        success: false,
        error: (error as Error).message || 'Unknown error',
      };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string, sessionId: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const data = await http.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/verify-otp',
        { phoneNumber, otp, sessionId },
        { timeoutMs: CONFIG.NETWORK.TIMEOUT_MS }
      );
      await this.storeToken(data.data.token);
      return data;
    } catch (error) {
      return {
        data: { user: {} as User, token: '' },
        success: false,
        error: (error as Error).message || 'Unknown error',
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
        await http.post('/auth/logout', undefined, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeoutMs: CONFIG.NETWORK.TIMEOUT_MS,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeToken();
    }
  }
}

export const authService = AuthService.getInstance();
