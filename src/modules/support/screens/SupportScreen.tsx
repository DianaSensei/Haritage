import { CONFIG } from '@/core/config';
import { faqService, type FAQItem } from '@/modules/support/services/faqService';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FaqMetaState {
  fromCache: boolean;
  stale: boolean;
  timestamp: number | null;
}

export const SupportScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { t, i18n } = useTranslation();

  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [faqMeta, setFaqMeta] = useState<FaqMetaState>({ fromCache: false, stale: false, timestamp: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatTimestamp = useCallback(
    (value: number | null): string | null => {
      if (!value) {
        return null;
      }

      try {
        const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value));
      } catch (error) {
        console.warn('Failed to format timestamp', error);
        return new Date(value).toLocaleString();
      }
    },
    [i18n.language]
  );

  const formattedUpdatedAt = useMemo(() => formatTimestamp(faqMeta.timestamp), [faqMeta.timestamp, formatTimestamp]);

  const loadFaqs = useCallback(
    async (forceRefresh: boolean = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const result = await faqService.getFaqs({ forceRefresh });
        setFaqItems(result.faqs);
        setFaqMeta({
          fromCache: result.fromCache,
          stale: result.stale,
          timestamp: result.timestamp,
        });
      } catch (error) {
        console.warn('Failed to load FAQs', error);
        setErrorMessage(t('support.faq.error'));
        Alert.alert(t('support.alerts.faqFailed.title'), t('support.alerts.faqFailed.body'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      void loadFaqs(false);
      return undefined;
    }, [loadFaqs])
  );

  const handleRefresh = useCallback(() => {
    void loadFaqs(true);
  }, [loadFaqs]);

  const handleCallSupport = useCallback(async () => {
    const normalizedPhone = CONFIG.SUPPORT.PHONE_NUMBER.replace(/[^+\d]/g, '');
    const telUrl = `tel:${normalizedPhone}`;

    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        throw new Error('Cannot open dialer');
      }
      await Linking.openURL(telUrl);
    } catch (error) {
      console.warn('Failed to open phone dialer', error);
      Alert.alert(
        t('support.alerts.phoneFailed.title'),
        t('support.alerts.phoneFailed.body', { phone: CONFIG.SUPPORT.PHONE_NUMBER })
      );
    }
  }, [t]);

  const handleEmailSupport = useCallback(async () => {
    const mailUrl = `mailto:${CONFIG.SUPPORT.EMAIL}`;

    try {
      const canOpen = await Linking.canOpenURL(mailUrl);
      if (!canOpen) {
        throw new Error('Cannot open mail client');
      }
      await Linking.openURL(mailUrl);
    } catch (error) {
      console.warn('Failed to open email client', error);
      Alert.alert(
        t('support.alerts.emailFailed.title'),
        t('support.alerts.emailFailed.body', { email: CONFIG.SUPPORT.EMAIL })
      );
    }
  }, [t]);

  const contactOptions = useMemo(
    () => [
      {
        key: 'call',
        icon: 'call-outline' as const,
        title: t('support.contact.actions.call.title'),
        description: t('support.contact.actions.call.description', {
          phone: CONFIG.SUPPORT.PHONE_NUMBER,
        }),
        onPress: handleCallSupport,
      },
      {
        key: 'email',
        icon: 'mail-outline' as const,
        title: t('support.contact.actions.email.title'),
        description: t('support.contact.actions.email.description', {
          email: CONFIG.SUPPORT.EMAIL,
        }),
        onPress: handleEmailSupport,
      },
    ],
    [handleCallSupport, handleEmailSupport, t]
  );

  const faqHelperLines = useMemo(() => {
    const lines: string[] = [];
    if (formattedUpdatedAt) {
      lines.push(t('support.faq.lastUpdated', { time: formattedUpdatedAt }));
    }
    if (faqMeta.fromCache) {
      lines.push(
        faqMeta.stale
          ? `${t('support.faq.cached')} — ${t('support.actions.retry')}`
          : t('support.faq.cached')
      );
    }
    return lines;
  }, [faqMeta.fromCache, faqMeta.stale, formattedUpdatedAt, t]);

  const renderFaqContent = () => {
    if (isLoading && !faqItems.length) {
      return (
        <View style={styles.optionStateRow}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      );
    }

    if (!faqItems.length) {
      return (
        <View style={styles.optionStateRow}>
          <ThemedText style={styles.optionStateText}>{t('support.faq.empty')}</ThemedText>
        </View>
      );
    }

    return faqItems.map((item, index) => (
      <View
        key={item.id}
        style={[styles.optionRow, styles.optionRowStatic, index > 0 && styles.optionRowDivider]}
      >
        <View style={[styles.optionIcon, styles.optionIconFaq]}>
          <Ionicons name="help-circle-outline" size={18} color={colors.accent} />
        </View>
        <View style={styles.optionContent}>
          <ThemedText style={styles.optionTitle}>{item.question}</ThemedText>
          <ThemedText style={styles.optionDescription}>{item.answer}</ThemedText>
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="chevron-back" size={20} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('support.title')}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.helperCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <View style={styles.helperTextGroup}>
            <ThemedText style={styles.helperText}>{t('support.subtitle')}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('support.contact.title')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>{t('support.contact.description')}</ThemedText>
        </View>

        <View style={styles.optionCard}>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionRow, index > 0 && styles.optionRowDivider]}
              onPress={option.onPress}
              activeOpacity={0.72}
              accessibilityRole="button"
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.optionContent}>
                <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('support.faq.title')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>{t('support.faq.description')}</ThemedText>
        </View>

        {faqHelperLines.length > 0 && (
          <View style={styles.helperCard}>
            <Ionicons name="time-outline" size={20} color={colors.info} />
            <View style={styles.helperTextGroup}>
              {faqHelperLines.map((line, index) => (
                <ThemedText
                  key={`${line}-${index}`}
                  style={index === 0 ? styles.helperText : styles.helperSubtext}
                >
                  {line}
                </ThemedText>
              ))}
            </View>
          </View>
        )}

        <View style={styles.optionCard}>{renderFaqContent()}</View>

        {errorMessage && (
          <>
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.retryButtonText}>{t('support.actions.retry')}</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
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
      color: colors.text,
    },
    headerSpacer: {
      width: 32,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
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
    helperTextGroup: {
      flex: 1,
      gap: 4,
    },
    helperText: {
      fontSize: 14,
      color: colors.text,
    },
    helperSubtext: {
      fontSize: 12,
      color: colors.textMuted,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
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
    },
    optionRowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borderMuted,
    },
    optionRowStatic: {
      backgroundColor: colors.surface,
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
    optionIconFaq: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    optionContent: {
      flex: 1,
      gap: 4,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textMuted,
    },
    optionStateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
      paddingHorizontal: 16,
    },
    optionStateText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.warning,
      backgroundColor: colors.warningSoft,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: colors.warning,
    },
    retryButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
