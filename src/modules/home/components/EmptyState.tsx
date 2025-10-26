import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isLoading = false }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Ionicons name="hourglass-outline" size={64} color="#818384" />
        <Text style={styles.title}>Loading posts...</Text>
        <Text style={styles.subtitle}>We're fetching the latest content for you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="images-outline" size={72} color="#0a66c2" />
      </View>

      <Text style={styles.title}>No posts yet</Text>
      <Text style={styles.subtitle}>Be the first to share something with the community!</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/create-post')}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={18} color="#ffffff" />
        <Text style={styles.actionButtonText}>Create First Post</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.hintText}>
        Posts from the community will appear here. Follow creators to see their latest updates.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#1a1a1b',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#272729',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#343536',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e4e6eb',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#818384',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0a66c2',
    marginBottom: 24,
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: '#343536',
    marginVertical: 24,
  },
  hintText: {
    fontSize: 12,
    color: '#818384',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default EmptyState;
