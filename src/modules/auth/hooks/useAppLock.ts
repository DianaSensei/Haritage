import { useAuthStore } from '@/core/store/slices/authSlice';
import { useLockStore } from '@/core/store/slices/lockSlice';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { pinService } from '../services/pinService';

/**
 * Hook to manage app lock based on lifecycle events
 * Locks the app when it goes to background and comes back to foreground
 */
export const useAppLock = () => {
  const { isAuthenticated } = useAuthStore();
  const { setLocked, setNeedsPinSetup } = useLockStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Check if PIN setup is needed on mount
    checkPinSetup();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  const checkPinSetup = async () => {
    if (!isAuthenticated) return;

    const isPinSet = await pinService.isPinSet();
    if (!isPinSet) {
      // PIN not set, show setup screen
      setNeedsPinSetup(true);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Only handle lock if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // App coming back to foreground from background
    if ((appState.current === 'inactive' || appState.current === 'background') && nextAppState === 'active') {
      const shouldLock = await pinService.shouldLock();
      if (shouldLock) {
        setLocked(true);
      }
    }

    // App going to background
    if (appState.current === 'active' && (nextAppState === 'inactive' || nextAppState === 'background')) {
      // We could add additional logic here if needed
    }

    appState.current = nextAppState;
  };

  return {
    checkPinSetup,
  };
};
