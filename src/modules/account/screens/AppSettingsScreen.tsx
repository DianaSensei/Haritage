import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguageStore } from '@/core/store';
import { ThemedText } from '@/shared/components';
import { SettingsHeader } from '@/shared/components/layout/SettingsHeader';
import { useAppTheme } from '@/shared/hooks';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/shared/i18n';
import type { ThemePreference } from '@/shared/types';

export const AppSettingsScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colors, themePreference, setThemePreference, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const themeOptions = useMemo(
    () => [
      {
        value: 'system' as ThemePreference,
        title: t('appSettings.themes.systemTitle'),
        description: t('appSettings.themes.systemDescription'),
        icon: 'phone-portrait-outline' as const,
      },
      {
        value: 'light' as ThemePreference,
        title: t('appSettings.themes.lightTitle'),
        description: t('appSettings.themes.lightDescription'),
        icon: 'sunny-outline' as const,
      },
      {
        value: 'dark' as ThemePreference,
        title: t('appSettings.themes.darkTitle'),
        description: t('appSettings.themes.darkDescription'),
        icon: 'moon-outline' as const,
      },
    ],
    [t]
  );

  const activeThemeLabel = useMemo(() => {
    const themeLabels: Record<ThemePreference, string> = {
      system: `${t('appSettings.themes.systemTitle')} (${t(
        theme === 'dark' ? 'appSettings.themes.darkTitle' : 'appSettings.themes.lightTitle'
      )})`,
      light: t('appSettings.themes.lightTitle'),
      dark: t('appSettings.themes.darkTitle'),
    };

    return themeLabels[themePreference];
  }, [t, themePreference, theme]);

  const languageOptions = useMemo(
    () =>
      (Object.keys(SUPPORTED_LANGUAGES) as AppLanguage[]).map((value) => ({
        value,
        title: t(`appSettings.languages.${value}` as const),
      })),
    [t]
  );

  const activeLanguageLabel =
    languageOptions.find((option) => option.value === language)?.title ??
    SUPPORTED_LANGUAGES[language]?.label ??
    language.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <SettingsHeader
        title={t('appSettings.title')}
        onBack={() => router.back()}
        backAccessibilityLabel={t('common.goBack')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('appSettings.appearanceTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('appSettings.appearanceDescription')}
          </ThemedText>
        </View>

        <View style={styles.optionCard}>
          {themeOptions.map((option) => {
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
            {t('appSettings.helperActivePreference', { label: activeThemeLabel })}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('appSettings.languageTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('appSettings.languageDescription')}
          </ThemedText>
        </View>

        <View style={styles.optionCard}>
          {languageOptions.map((option) => {
            const isActive = language === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionRow, isActive && styles.optionRowActive]}
                onPress={() => setLanguage(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.optionIcon, isActive && styles.optionIconActive]}>
                  <ThemedText
                    style={[styles.languageCode, isActive && styles.languageCodeActive]}
                  >
                    {option.value.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
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
          <Ionicons name="globe-outline" size={20} color={colors.info} />
          <ThemedText style={styles.helperText}>
            {t('appSettings.helperActivePreference', { label: activeLanguageLabel })}
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
    languageCode: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    languageCodeActive: {
      color: colors.accent,
    },
  });
