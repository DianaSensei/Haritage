import { useCallback } from 'react';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { authService } from '../services/authService';
import { User } from '@/shared/types';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    login,
    logout: storeLogout,
    updateUser,
    clearError,
  } = useAuthStore();

  const sendOTP = useCallback(async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.sendOTP(phoneNumber);
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        return false;
      }
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const verifyOTP = useCallback(async (phoneNumber: string, otp: string, sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.verifyOTP(phoneNumber, otp, sessionId);
      if (!result.success) {
        setError(result.error || 'Invalid OTP');
        return false;
      }
      
      login(result.data.user);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, login]);

  const authenticateWithBiometric = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isAvailable = await authService.isBiometricAvailable();
      if (!isAvailable) {
        setError('Biometric authentication is not available');
        return false;
      }

      const isAuthenticated = await authService.authenticateWithBiometric();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          return true;
        }
      }
      
      setError('Biometric authentication failed');
      return false;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  const enableBiometric = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await authService.enableBiometric();
      if (success && user) {
        updateUser({ isBiometricEnabled: true });
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, user, updateUser]);

  const disableBiometric = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.disableBiometric();
      if (user) {
        updateUser({ isBiometricEnabled: false });
      }
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, user, updateUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.logout();
      storeLogout();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeLogout]);

  const checkBiometricAvailability = useCallback(async () => {
    return await authService.isBiometricAvailable();
  }, []);

  const checkBiometricEnabled = useCallback(async () => {
    return await authService.isBiometricEnabled();
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    sendOTP,
    verifyOTP,
    authenticateWithBiometric,
    enableBiometric,
    disableBiometric,
    logout,
    checkBiometricAvailability,
    checkBiometricEnabled,
    clearError,
  };
};
