import { CONFIG } from '@/core/config';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export class PinService {
  private static instance: PinService;

  static getInstance(): PinService {
    if (!PinService.instance) {
      PinService.instance = new PinService();
    }
    return PinService.instance;
  }

  // Hash PIN before storing (for security)
  private async hashPin(pin: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin
    );
  }

  // Set up a new PIN
  async setPin(pin: string): Promise<boolean> {
    try {
      if (pin.length !== CONFIG.AUTH.PIN_LENGTH) {
        throw new Error(`PIN must be exactly ${CONFIG.AUTH.PIN_LENGTH} digits`);
      }

      const hashedPin = await this.hashPin(pin);
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_PIN, hashedPin);
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.PIN_ENABLED, 'true');
      return true;
    } catch (error) {
      console.error('Failed to set PIN:', error);
      return false;
    }
  }

  // Verify PIN
  async verifyPin(pin: string): Promise<boolean> {
    try {
      const storedHash = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.USER_PIN);
      if (!storedHash) {
        return false;
      }

      const hashedInput = await this.hashPin(pin);
      return hashedInput === storedHash;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }

  // Check if PIN is set
  async isPinSet(): Promise<boolean> {
    try {
      const pin = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.USER_PIN);
      return pin !== null;
    } catch {
      return false;
    }
  }

  // Check if PIN is enabled
  async isPinEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.PIN_ENABLED);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  // Enable PIN lock
  async enablePin(): Promise<void> {
    try {
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.PIN_ENABLED, 'true');
    } catch (error) {
      console.error('Failed to enable PIN:', error);
    }
  }

  // Disable PIN lock
  async disablePin(): Promise<void> {
    try {
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.PIN_ENABLED, 'false');
    } catch (error) {
      console.error('Failed to disable PIN:', error);
    }
  }

  // Remove PIN (for logout or reset)
  async removePin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.USER_PIN);
      await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.PIN_ENABLED);
    } catch (error) {
      console.error('Failed to remove PIN:', error);
    }
  }

  // Update last authenticated timestamp
  async updateLastAuthenticated(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.LAST_AUTHENTICATED, timestamp);
    } catch (error) {
      console.error('Failed to update last authenticated:', error);
    }
  }

  // Get last authenticated timestamp
  async getLastAuthenticated(): Promise<number | null> {
    try {
      const timestamp = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.LAST_AUTHENTICATED);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch {
      return null;
    }
  }

  // Check if app should be locked based on timeout
  async shouldLock(): Promise<boolean> {
    try {
      const isPinEnabled = await this.isPinEnabled();
      if (!isPinEnabled) {
        return false;
      }

      const lastAuth = await this.getLastAuthenticated();
      if (!lastAuth) {
        return true; // No last auth, should lock
      }

      const timeSinceAuth = Date.now() - lastAuth;
      return timeSinceAuth > CONFIG.AUTH.LOCK_TIMEOUT_MS;
    } catch {
      return false;
    }
  }
}

export const pinService = PinService.getInstance();
