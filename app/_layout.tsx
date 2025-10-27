import {
  setStatusBarBackgroundColor,
  setStatusBarHidden,
  setStatusBarStyle,
} from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { StoreProvider } from '@/core/store';
import { useAppLockStore } from '@/core/store/slices/appLockSlice';
import { useAuthStore } from '@/core/store/slices/authSlice';
import { useAppLock } from '@/modules/auth/hooks/useAppLock';
import { useAppLockManager } from '@/modules/auth/hooks/useAppLockManager';
import { AuthScreen } from '@/modules/auth/screens/AuthScreen';
import { LockScreen } from '@/modules/auth/screens/LockScreen';
import { PINSetupScreen } from '@/modules/auth/screens/PINSetupScreen';
import { useColorScheme } from '@/shared/hooks';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const pinSetupRequired = useAppLockStore((state) => state.pinSetupRequired);
  const isLocked = useAppLockStore((state) => state.isLocked);
  const setLastAuthTimestamp = useAppLockStore((state) => state.setLastAuthTimestamp);
  const { isInitializing } = useAppLockManager();
  useAppLock();

  const handleAuthEvent = useCallback(() => {
    setLastAuthTimestamp(Date.now());
  }, [setLastAuthTimestamp]);

  const shouldShowPinSetup = isAuthenticated && !isInitializing && pinSetupRequired;
  const shouldShowLockScreen = isAuthenticated && !pinSetupRequired && isLocked;

  // Set status bar style and background to prevent flicker
  useEffect(() => {
    setStatusBarStyle(colorScheme === "dark" ? "light" : "dark");
    setStatusBarBackgroundColor(colorScheme === "dark" ? "#000" : "#fff");
    setStatusBarHidden(false);
  }, [colorScheme]);

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1b',
    zIndex: 100,
  },
});
