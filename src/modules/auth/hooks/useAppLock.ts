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
  const shouldLockOnForeground = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const {
    isLocked,
    pinSetupRequired,
    setLocked,
    setLastAuthTimestamp,
    lastAuthTimestamp,
    suppressLockUntil,
    clearSuppressLock,
  } = useAppLockStore();

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      const prevState = appState.current;
      appState.current = nextAppState;

      if (prevState === 'background' && nextAppState === 'active') {
        if (isAuthenticated && !pinSetupRequired && shouldLockOnForeground.current) {
          const isPinSet = await pinService.isPinSetUp();
          if (isPinSet) {
            const now = Date.now();
            if (suppressLockUntil && suppressLockUntil > now) {
              clearSuppressLock();
              shouldLockOnForeground.current = false;
              return;
            }
            clearSuppressLock();
            shouldLockOnForeground.current = false;

            const timeoutMs = CONFIG.APP_LOCK.LOCK_TIMEOUT_MS;
            if (timeoutMs > 0) {
              setTimeout(() => {
                setLocked(true);
              }, timeoutMs);
            } else {
              setLocked(true);
            }
          } else {
            shouldLockOnForeground.current = false;
            clearSuppressLock();
          }
        } else {
          clearSuppressLock();
          shouldLockOnForeground.current = false;
        }
      } else if (nextAppState === 'background') {
        setLastAuthTimestamp(Date.now());

        if (isAuthenticated && !pinSetupRequired) {
          const now = Date.now();
          if (suppressLockUntil && suppressLockUntil > now) {
            shouldLockOnForeground.current = false;
            return;
          }
          shouldLockOnForeground.current = true;
        }
      } else if (nextAppState === 'inactive') {
        setLastAuthTimestamp(Date.now());
      }
    },
    [
      clearSuppressLock,
      isAuthenticated,
      pinSetupRequired,
      setLastAuthTimestamp,
      setLocked,
      suppressLockUntil,
    ]
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
