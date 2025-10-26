import { CONFIG } from '@/core/config';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { pinService } from '@/shared/services/security/pinService';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * useAppLock Hook
 * Monitors app lifecycle and triggers lock/unlock based on app state changes
 * Features:
 * - Automatic lock when app goes to background
 * - Configurable lock timeout
 * - Tracks last authentication time
 * - Prevents locking before PIN is set up
 */

export const useAppLock = () => {
  const appState = useRef(AppState.currentState);
  const { isAuthenticated } = useAuthStore();
  const {
    isLocked,
    pinSetupRequired,
    setLocked,
    setLastAuthTimestamp,
    lastAuthTimestamp,
  } = useAppLockStore();

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      const prevState = appState.current;
      appState.current = nextAppState;

      // Detect transition from background to foreground
      if (prevState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        if (isAuthenticated && !pinSetupRequired) {
          // Check if PIN is set up
          const isPinSet = await pinService.isPinSetUp();
          if (isPinSet) {
            // Lock the app immediately or after timeout
            const timeoutMs = CONFIG.APP_LOCK.LOCK_TIMEOUT_MS;
            if (timeoutMs > 0) {
              setTimeout(() => {
                setLocked(true);
              }, timeoutMs);
            } else {
              setLocked(true);
            }
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background - record timestamp
        setLastAuthTimestamp(Date.now());
      }
    },
    [isAuthenticated, pinSetupRequired, setLocked, setLastAuthTimestamp]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  return {
    isLocked,
    lastAuthTimestamp,
  };
};
