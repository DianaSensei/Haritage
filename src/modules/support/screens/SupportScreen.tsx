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

  const renderFaqItems = () => {
    if (isLoading && !faqItems.length) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      );
    }

    if (!faqItems.length && !isLoading) {
      return <ThemedText style={styles.emptyText}>{t('support.faq.empty')}</ThemedText>;
    }

    return faqItems.map((item) => (
      <View key={item.id} style={styles.faqCard}>
        <View style={styles.faqHeader}>
          <Ionicons name="help-buoy" size={20} color={colors.accent} />
          <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
        </View>
        <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <ThemedText style={styles.headerTitle}>{t('support.title')}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{t('support.subtitle')}</ThemedText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('support.contact.title')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>{t('support.contact.description')}</ThemedText>

          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleCallSupport}
              activeOpacity={0.78}
            >
              <View style={styles.actionIconWrapper}>
                <Ionicons name="call" size={18} color={colors.surface} />
              </View>
              <View style={styles.actionTextWrapper}>
                <ThemedText style={styles.actionTitle}>
                  {t('support.contact.actions.call.title')}
                </ThemedText>
                <ThemedText style={styles.actionSubtitle}>
                  {t('support.contact.actions.call.description', { phone: CONFIG.SUPPORT.PHONE_NUMBER })}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleEmailSupport}
              activeOpacity={0.78}
            >
              <View style={styles.actionIconWrapper}>
                <Ionicons name="mail" size={18} color={colors.surface} />
              </View>
              <View style={styles.actionTextWrapper}>
                <ThemedText style={styles.actionTitle}>
                  {t('support.contact.actions.email.title')}
                </ThemedText>
                <ThemedText style={styles.actionSubtitle}>
                  {t('support.contact.actions.email.description', { email: CONFIG.SUPPORT.EMAIL })}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('support.faq.title')}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>{t('support.faq.description')}</ThemedText>

          {formattedUpdatedAt && (
            <ThemedText style={styles.helperText}>
              {t('support.faq.lastUpdated', { time: formattedUpdatedAt })}
            </ThemedText>
          )}

          {faqMeta.fromCache && (
            <ThemedText style={styles.helperText}>
              {faqMeta.stale
                ? `${t('support.faq.cached')} — ${t('support.actions.retry')}`
                : t('support.faq.cached')}
            </ThemedText>
          )}

          {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

          {renderFaqItems()}

          {!isLoading && errorMessage && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh} activeOpacity={0.8}>
              <ThemedText style={styles.retryButtonText}>{t('support.actions.retry')}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    headerTextGroup: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      marginTop: 2,
      fontSize: 14,
      color: colors.textMuted,
    },
    content: {
      padding: 16,
      gap: 20,
    },
    section: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    sectionSubtitle: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textMuted,
    },
    cardGroup: {
      marginTop: 16,
      gap: 12,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 14,
    },
    actionIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionTextWrapper: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    actionSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    loadingState: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textMuted,
    },
    errorText: {
      marginTop: 12,
      fontSize: 13,
      color: colors.warning,
    },
    helperText: {
      marginTop: 12,
      fontSize: 12,
      color: colors.textMuted,
    },
    faqCard: {
      marginTop: 16,
      padding: 16,
      borderRadius: 14,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 12,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 16,
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
