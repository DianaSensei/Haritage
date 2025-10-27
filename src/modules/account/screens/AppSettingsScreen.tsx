import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';
import type { ThemePreference } from '@/shared/types';

const THEME_OPTIONS: {
  value: ThemePreference;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'system',
    title: 'System Default',
    description: 'Match your device appearance automatically.',
    icon: 'phone-portrait-outline',
  },
  {
    value: 'light',
    title: 'Light',
    description: 'Bright surfaces with crisp contrast.',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    title: 'Dark',
    description: 'Dimmed surfaces with reduced glare.',
    icon: 'moon-outline',
  },
];

export const AppSettingsScreen: React.FC = () => {
  const router = useRouter();
  const { colors, themePreference, setThemePreference, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const activeThemeLabel = themePreference === 'system'
    ? `System (currently ${theme === 'dark' ? 'Dark' : 'Light'})`
    : themePreference === 'dark'
      ? 'Dark'
      : 'Light';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>App Settings</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Choose how Haritage should look. You can follow the device or force a specific theme.
          </ThemedText>
        </View>

        <View style={styles.optionCard}>
          {THEME_OPTIONS.map((option, index) => {
            const isActive = themePreference === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionRow, isActive && styles.optionRowActive]}
                onPress={() => setThemePreference(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={isActive ? colors.accent : colors.icon}
                  />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                  <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
                </View>
                <Ionicons
                  name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isActive ? colors.accent : colors.iconMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.helperCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <ThemedText style={styles.helperText}>
            Active preference: {activeThemeLabel}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
    },
    headerSpacer: {
      width: 32,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textMuted,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 16,
      backgroundColor: colors.surface,
    },
    optionRowActive: {
      backgroundColor: colors.highlight,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    optionIconActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    optionContent: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    helperCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.infoSoft,
      borderWidth: 1,
      borderColor: colors.info,
    },
    helperText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
  });
