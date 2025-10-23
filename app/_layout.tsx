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
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { useColorScheme } from "@/shared/hooks";
import { Slot } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();

  // Set status bar style and background to prevent flicker
  useEffect(() => {
    setStatusBarStyle(colorScheme === "dark" ? "dark" : "light");
    setStatusBarBackgroundColor(colorScheme === "dark" ? "#000" : "#fff");
    setStatusBarHidden(false);
  }, [colorScheme]);

  return (
    <StoreProvider>
      {isAuthenticated ? (
        <View style={styles.container}>
          <Slot />
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
    backgroundColor: "#fff",
  },
});
