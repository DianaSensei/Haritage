import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    mockStoreFronts,
} from '@/modules/commercial/data/mockStores';
import { StoreFront } from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const resolveParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const StoreInfoScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ storeId?: string | string[] }>();
  const storeId = resolveParam(params.storeId);
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const store = useMemo<StoreFront | undefined>(
    () => mockStoreFronts.find((item) => item.id === storeId),
    [storeId],
  );

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language ?? 'en', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [i18n.language],
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!store) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.missingWrapper}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.missingContent}>
            <ThemedText style={styles.missingTitle}>{t('commercial.storeInfo.missingTitle')}</ThemedText>
            <ThemedText style={styles.missingSubtitle}>{t('commercial.storeInfo.missingSubtitle')}</ThemedText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrapper}>
          <Image source={{ uri: store.bannerUrl }} style={styles.bannerImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
            {store.logoUrl ? (
              <Image source={{ uri: store.logoUrl }} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <View style={[styles.logoFallback, { backgroundColor: store.accentColor }]}>
                <ThemedText style={styles.logoFallbackText}>{store.initials}</ThemedText>
              </View>
            )}

            <View style={styles.titleBlock}>
              <ThemedText style={styles.storeName}>{store.name}</ThemedText>
              <ThemedText style={styles.storeCategory}>{store.category}</ThemedText>
            </View>
          </View>

          {store.promoMessage ? (
            <View style={styles.promoBanner}>
              <Ionicons name="sparkles" size={14} color={colors.accentStrong} />
              <ThemedText style={styles.promoText}>{store.promoMessage}</ThemedText>
            </View>
          ) : null}

          <View style={styles.statRow}>
            <StatPill
              icon="star"
              label={t('commercial.storeInfo.stats.rating')}
              value={store.rating.toFixed(1)}
              styles={styles}
            />
            <StatPill
              icon="people"
              label={t('commercial.storeInfo.stats.followers')}
              value={formatter.format(store.followers)}
              styles={styles}
            />
            <StatPill
              icon="cube"
              label={t('commercial.storeInfo.stats.products')}
              value={formatter.format(store.productCount)}
              styles={styles}
            />
          </View>

          <View style={styles.infoSection}>
            <SectionHeader title={t('commercial.storeInfo.aboutTitle')} styles={styles} />
            <ThemedText style={styles.description}>{store.description}</ThemedText>
            <View style={styles.metaRow}>
              <Ionicons name="person" size={16} color={colors.textMuted} />
              <ThemedText style={styles.metaText}>
                {t('commercial.storeInfo.ownerLabel', { owner: store.ownerName })}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={colors.textMuted} />
              <ThemedText style={styles.metaText}>
                {t('commercial.storeInfo.locationLabel', { address: store.address })}
              </ThemedText>
            </View>
          </View>

          <SectionHeader title={t('commercial.storeInfo.categoriesTitle')} styles={styles} />
          <View style={styles.categoryWrapper}>
            {store.categories.map((category) => (
              <View key={category.id} style={styles.categoryBlock}>
                <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                <View style={styles.categoryList}>
                  {category.items.map((item) => (
                    <View key={item.id} style={styles.productRow}>
                      <View style={styles.productInfo}>
                        <ThemedText style={styles.productName}>{item.name}</ThemedText>
                        {item.description ? (
                          <ThemedText style={styles.productDescription} numberOfLines={2}>
                            {item.description}
                          </ThemedText>
                        ) : null}
                      </View>
                      <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    bannerWrapper: {
      position: 'relative',
      height: 200,
      marginBottom: 24,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contentWrapper: {
      paddingHorizontal: 20,
      gap: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    logoImage: {
      width: 72,
      height: 72,
      borderRadius: 24,
    },
    logoFallback: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoFallbackText: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    titleBlock: {
      flex: 1,
      gap: 8,
    },
    storeName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    storeCategory: {
      fontSize: 13,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    promoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    promoText: {
      flex: 1,
      fontSize: 13,
      color: colors.accentStrong,
    },
    statRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    statPill: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      gap: 6,
    },
    statIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    infoSection: {
      gap: 12,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    categoryWrapper: {
      gap: 20,
    },
    categoryBlock: {
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    categoryList: {
      gap: 12,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
      justifyContent: 'space-between',
    },
    productInfo: {
      flex: 1,
      gap: 4,
    },
    productName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    productDescription: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
    productPrice: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    missingWrapper: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 32,
    },
    missingContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    missingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    missingSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });

interface StatPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}

const StatPill: React.FC<StatPillProps> = ({ icon, label, value, styles }) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.statPill, { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={styles.statIconWrapper}>
        <Ionicons name={icon} size={14} color={colors.accentStrong} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
};

interface SectionHeaderProps {
  title: string;
  styles: ReturnType<typeof createStyles>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, styles }) => {
  return <ThemedText style={styles.sectionHeader}>{title}</ThemedText>;
};

export default StoreInfoScreen;
