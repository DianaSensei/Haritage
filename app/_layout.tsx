import {
  setStatusBarBackgroundColor,
  setStatusBarHidden,
  setStatusBarStyle,
} from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { StoreProvider } from '@/core/store';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { useAppLock } from '@/modules/auth/hooks/useAppLock';
import { useAppLockManager } from '@/modules/auth/hooks/useAppLockManager';
import { AuthScreen } from '@/modules/auth/screens/AuthScreen';
import { LockScreen } from '@/modules/auth/screens/LockScreen';
import { PINSetupScreen } from '@/modules/auth/screens/PINSetupScreen';
import { useAppTheme } from '@/shared/hooks';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const { colors, theme } = useAppTheme();
  const { isAuthenticated } = useAuthStore();
  const pinSetupRequired = useAppLockStore((state) => state.pinSetupRequired);
  const isLocked = useAppLockStore((state) => state.isLocked);
  const setLastAuthTimestamp = useAppLockStore((state) => state.setLastAuthTimestamp);
  const { isInitializing } = useAppLockManager();
  useAppLock();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleAuthEvent = useCallback(() => {
    setLastAuthTimestamp(Date.now());
  }, [setLastAuthTimestamp]);

  const shouldShowPinSetup = isAuthenticated && !isInitializing && pinSetupRequired;
  const shouldShowLockScreen = isAuthenticated && !pinSetupRequired && isLocked;

  // Set status bar style and background to prevent flicker
  useEffect(() => {
    setStatusBarStyle(theme === 'dark' ? 'light' : 'dark');
    if (Platform.OS === 'android') {
      setStatusBarBackgroundColor(colors.background);
    }
    setStatusBarHidden(false);
  }, [colors.background, theme]);

  return (
    <StoreProvider>
      {isAuthenticated ? (
        <View style={styles.container}>
          <Slot />

          {shouldShowPinSetup ? (
            <View style={styles.overlay} pointerEvents="auto">
              <PINSetupScreen onComplete={handleAuthEvent} />
            </View>
          ) : null}

          {shouldShowLockScreen ? (
            <View style={styles.overlay} pointerEvents="auto">
              <LockScreen onUnlock={handleAuthEvent} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.container}>
          <AuthScreen />
        </View>
      )}
    </StoreProvider>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      zIndex: 100,
    },
  });
