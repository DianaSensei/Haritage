import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Biometric Service - Handles biometric authentication (Face ID, Touch ID, Fingerprint)
 */

export const biometricService = {
  /**
   * Check if biometric is available on device
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  /**
   * Get available biometric types
   */
  async getAvailableBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting available biometrics:', error);
      return [];
    }
  },

  /**
   * Authenticate using biometric
   */
  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  /**
   * Get biometric type name for UI display
   */
  async getBiometricTypeName(): Promise<string> {
    try {
      const types = await this.getAvailableBiometrics();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      }
      return 'Biometric';
    } catch {
      return 'Biometric';
    }
  },
};
