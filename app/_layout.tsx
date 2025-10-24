import {
  setStatusBarBackgroundColor,
  setStatusBarHidden,
  setStatusBarStyle,
} from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { StoreProvider } from "@/core/store";
import { useAuthStore } from "@/core/store/slices/authSlice";
import { useLockStore } from "@/core/store/slices/lockSlice";
import { LockScreen } from "@/modules/auth/components/LockScreen";
import { PinSetupScreen } from "@/modules/auth/components/PinSetupScreen";
import { useAppLock } from "@/modules/auth/hooks/useAppLock";
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { useColorScheme } from "@/shared/hooks";
import { Slot } from "expo-router";

function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { isLocked, needsPinSetup, setLocked, setNeedsPinSetup } = useLockStore();

  // Initialize app lock listener
  useAppLock();

  // Set status bar style and background to prevent flicker
  useEffect(() => {
    setStatusBarStyle(colorScheme === "dark" ? "dark" : "light");
    setStatusBarBackgroundColor(colorScheme === "dark" ? "#000" : "#fff");
    setStatusBarHidden(false);
  }, [colorScheme]);

  // If not authenticated, show auth screen
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <AuthScreen />
      </View>
    );
  }

  // If needs PIN setup, show setup screen
  if (needsPinSetup) {
    return (
      <PinSetupScreen
        onComplete={() => setNeedsPinSetup(false)}
        onSkip={() => setNeedsPinSetup(false)}
        allowSkip={true}
      />
    );
  }

  // If locked, show lock screen
  if (isLocked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  // Normal app flow
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <AppContent />
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
    backgroundColor: "#fff",
  },
});
