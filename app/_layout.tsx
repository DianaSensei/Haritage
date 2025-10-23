import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StoreProvider } from "@/core/store";
import { useColorScheme } from "@/shared/hooks";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <StoreProvider>
          <Slot />
        </StoreProvider>
        <StatusBar style={colorScheme === "dark" ? "dark" : "light"} />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
