import { StoreProvider } from "@/core/store";
import { useAuthStore } from "@/core/store/slices/authSlice";
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { HomeScreen } from "@/modules/home/screens/HomeScreen";
import React from "react";
import { StyleSheet } from "react-native";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //     </View>
  //   );
  // }

  return (
    <StoreProvider>
      {isAuthenticated ? <HomeScreen /> : <AuthScreen />}
    </StoreProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
