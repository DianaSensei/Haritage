import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isLoading = false }) => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Ionicons name="hourglass-outline" size={64} color={colors.iconMuted} />
        <Text style={styles.title}>Loading posts...</Text>
        <Text style={styles.subtitle}>We're fetching the latest content for you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="images-outline" size={72} color={colors.accent} />
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

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
      gap: 16,
      backgroundColor: colors.background,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 999,
      backgroundColor: colors.accent,
      marginBottom: 16,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
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
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: 12,
    },
    hintText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 18,
      maxWidth: 280,
    },
  });

export default EmptyState;
