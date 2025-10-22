import { ThemedText, ThemedView } from '@/shared/components';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export const MapScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Map</ThemedText>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {Platform.select({
            ios: 'Native map placeholder (iOS)',
            android: 'Native map placeholder (Android)',
            web: 'Map is not available on web in this demo',
          })}
        </Text>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  placeholderText: {
    color: '#666',
  },
});
