import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ThemedText, ThemedView } from '@/shared/components';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    Alert.alert('Logged out', 'You have been logged out');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Account</ThemedText>
      <View style={styles.section}>
        <ThemedText type="subtitle">Name</ThemedText>
        <ThemedText>{user?.name ?? 'Guest'}</ThemedText>
      </View>
      <View style={styles.section}>
        <ThemedText type="subtitle">Phone</ThemedText>
        <ThemedText>{user?.phoneNumber ?? 'Not provided'}</ThemedText>
      </View>
      <View style={styles.section}>
        <ThemedText type="subtitle">Verified</ThemedText>
        <ThemedText>{user?.phoneNumber ? 'Yes' : 'No'}</ThemedText>
      </View>

      <View style={styles.actions}>
        <ThemedText type="link" onPress={() => Alert.alert('Security', 'Security settings placeholder')}>Security settings</ThemedText>
        <ThemedText type="link" onPress={() => Alert.alert('Settings', 'App settings placeholder')}>App settings</ThemedText>
        <ThemedText type="link" onPress={() => Alert.alert('Help', 'Help & support placeholder')}>Help & Support</ThemedText>
        <ThemedText type="link" onPress={handleLogout}>Logout</ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 12,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
