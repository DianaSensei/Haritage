import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { pinService } from '@/shared/services/security/pinService';
import { useEffect, useRef, useState } from 'react';

export const useAppLockManager = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPinSetupRequired = useAppLockStore((state) => state.setPinSetupRequired);
  const setPinHash = useAppLockStore((state) => state.setPinHash);
  const setBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const setLocked = useAppLockStore((state) => state.setLocked);
  const resetAppLock = useAppLockStore((state) => state.resetAppLock);
  const setLastAuthTimestamp = useAppLockStore((state) => state.setLastAuthTimestamp);

  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!isAuthenticated) {
        hasInitializedRef.current = false;
        resetAppLock();
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      if (hasInitializedRef.current) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      setIsInitializing(true);

      try {
        const [pinHash, biometricEnabled, pinSetupFlag] = await Promise.all([
          pinService.getPinHash(),
          pinService.isBiometricEnabled(),
          pinService.getPinSetupRequired(),
        ]);

        if (!isMounted) {
          return;
        }

        setPinHash(pinHash);
        setBiometricEnabled(biometricEnabled);

        let nextPinSetupRequired: boolean;
        if (pinSetupFlag === null) {
          const hasPin = Boolean(pinHash);
          nextPinSetupRequired = !hasPin;
          await pinService.setPinSetupRequired(nextPinSetupRequired);
        } else {
          nextPinSetupRequired = pinSetupFlag;
        }

        setPinSetupRequired(nextPinSetupRequired);
        setLocked(false);
        setLastAuthTimestamp(Date.now());
  hasInitializedRef.current = true;
      } catch (error) {
        console.warn('Failed to initialize app lock', error);
        if (isMounted) {
          setPinSetupRequired(false);
          setLocked(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, resetAppLock, setBiometricEnabled, setLocked, setPinHash, setPinSetupRequired, setLastAuthTimestamp]);

  return {
    isInitializing,
  };
};
