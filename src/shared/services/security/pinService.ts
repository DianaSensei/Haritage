import { CONFIG } from '@/core/config';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * PIN Service - Handles PIN hashing, validation, and secure storage
 * Features:
 * - SHA-256 hashing for secure storage
 * - Numeric-only validation
 * - Platform-secure storage via SecureStore
 */

export const pinService = {
  /**
   * Hash a PIN using SHA-256
   */
  async hashPin(pin: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    return hash;
  },

  /**
   * Validate PIN format (6 digits, numeric only)
   */
  validatePinFormat(pin: string): boolean {
    const regex = /^\d{6}$/;
    return regex.test(pin);
  },

  /**
   * Store PIN hash securely
   */
  async storePinHash(pinHash: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.PIN_HASH, pinHash);
    } catch (error) {
      console.error('Error storing PIN hash:', error);
      throw error;
    }
  },

  /**
   * Retrieve stored PIN hash
   */
  async getPinHash(): Promise<string | null> {
    try {
      const hash = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.PIN_HASH);
      return hash || null;
    } catch (error) {
      console.error('Error retrieving PIN hash:', error);
      return null;
    }
  },

  /**
   * Verify PIN against stored hash
   */
  async verifyPin(pin: string): Promise<boolean> {
    if (!this.validatePinFormat(pin)) {
      return false;
    }

    try {
      const storedHash = await this.getPinHash();
      if (!storedHash) {
        return false;
      }

      const inputHash = await this.hashPin(pin);
      return inputHash === storedHash;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  },

  /**
   * Delete stored PIN hash
   */
  async deletePinHash(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.PIN_HASH);
    } catch (error) {
      console.error('Error deleting PIN hash:', error);
      throw error;
    }
  },

  /**
   * Check if PIN is set up
   */
  async isPinSetUp(): Promise<boolean> {
    try {
      const hash = await this.getPinHash();
      return hash !== null && hash.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Store biometric preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED,
        enabled ? 'true' : 'false'
      );
    } catch (error) {
      console.error('Error storing biometric preference:', error);
      throw error;
    }
  },

  /**
   * Get biometric preference
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    } catch (error) {
      console.error('Error retrieving biometric preference:', error);
      return false;
    }
  },

  /**
   * Clean up all app lock data (called on logout)
   */
  async clearAppLockData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.PIN_HASH).catch(() => {}),
        SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.BIOMETRIC_ENABLED).catch(() => {}),
      ]);
    } catch (error) {
      console.error('Error clearing app lock data:', error);
    }
  },
};
