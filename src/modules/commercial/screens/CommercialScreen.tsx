import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/core/config';
import {
    mockSectionItems,
    mockStoreFronts,
} from '@/modules/commercial/data/mockStores';
import {
    CommercialSection,
    CommercialSectionItem,
    StoreFront,
} from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const SECTION_ORDER: CommercialSection[] = [
  'forYou',
  'topSale',
  'newArrivals',
  'buyAgain',
  'suggestions',
];

const sectionTitleKey = (section: CommercialSection) => `commercial.sections.${section}.title`;
const sectionSubtitleKey = (section: CommercialSection) => `commercial.sections.${section}.subtitle`;

export const CommercialScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const storeMap = useMemo(() => {
    const entries = mockStoreFronts.map((store) => [store.id, store] as const);
    return new Map<string, StoreFront>(entries);
  }, []);

  const sections = useMemo(
    () =>
      SECTION_ORDER.map((key) => {
        const title = t(sectionTitleKey(key));
        const subtitleKeyValue = sectionSubtitleKey(key);
        const subtitleTranslation = t(subtitleKeyValue);
        const subtitle = subtitleTranslation === subtitleKeyValue ? undefined : subtitleTranslation;

        return { key, title, subtitle };
      }),
    [t],
  );

  const handleSearchPress = useCallback(() => {
    router.push('/commercial-search');
  }, [router]);

  const handleOpenStore = useCallback(
    (storeId: string) => {
      router.push({ pathname: '/store-info', params: { storeId } });
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>{t('commercial.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('commercial.subtitle')}</ThemedText>
        </View>

        <TouchableOpacity
          style={styles.searchRow}
          activeOpacity={0.85}
          onPress={handleSearchPress}
          accessibilityRole="search"
          accessibilityLabel={t('commercial.searchPlaceholder')}
        >
          <Ionicons name="search" size={18} color={colors.iconMuted} />
          <ThemedText style={styles.searchPlaceholder} numberOfLines={1}>
            {t('commercial.searchPlaceholder')}
          </ThemedText>
          <Ionicons name="arrow-forward" size={16} color={colors.iconMuted} />
        </TouchableOpacity>

        {sections.map((section) => {
          const items = mockSectionItems[section.key];
          if (!items || items.length === 0) {
            return null;
          }

          return (
            <View key={section.key} style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                {section.subtitle ? (
                  <ThemedText style={styles.sectionSubtitle}>{section.subtitle}</ThemedText>
                ) : null}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productRow}
              >
                {items.map((item) => {
                  const store = storeMap.get(item.storeId);
                  if (!store) {
                    return null;
                  }

                  return (
                    <ProductCard
                      key={item.id}
                      item={item}
                      store={store}
                      onPress={() => handleOpenStore(store.id)}
                      styles={styles}
                      colors={colors}
                    />
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

interface ProductCardProps {
  item: CommercialSectionItem;
  store: StoreFront;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

const ProductCard: React.FC<ProductCardProps> = ({ item, store, onPress, styles, colors }) => (
  <TouchableOpacity
    style={styles.productCard}
    activeOpacity={0.88}
    accessibilityRole="button"
    onPress={onPress}
  >
    <View style={[styles.storeBadge, { backgroundColor: item.accentColor }]}>
      <ThemedText style={styles.storeBadgeText}>{item.storeBadge}</ThemedText>
    </View>

    <View style={styles.productContent}>
      {item.badge ? (
        <View style={styles.productBadge}>
          <ThemedText style={styles.productBadgeText}>{item.badge}</ThemedText>
        </View>
      ) : null}

      <ThemedText style={styles.productTitle} numberOfLines={2}>
        {item.name}
      </ThemedText>
      {item.subtitle ? (
        <ThemedText style={styles.productSubtitle} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      ) : null}
    </View>

    <View style={styles.productFooter}>
      <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
      <View style={styles.productStoreRow}>
        <Ionicons name="storefront" size={12} color={colors.iconMuted} />
        <ThemedText style={styles.productStoreName} numberOfLines={1}>
          {store.name}
        </ThemedText>
      </View>
    </View>

    {item.tags?.length ? (
      <View style={styles.productTagRow}>
        {item.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.productTagChip}>
            <ThemedText style={styles.productTagText}>{tag}</ThemedText>
          </View>
        ))}
      </View>
    ) : null}
  </TouchableOpacity>
);

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 24,
    },
    headerSection: {
      gap: 8,
      paddingTop: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Fonts.sans,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 14,
      color: colors.textMuted,
    },
    sectionBlock: {
      gap: 16,
    },
    sectionHeader: {
      gap: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    productRow: {
      flexDirection: 'row',
      gap: 16,
      paddingRight: 8,
    },
    productCard: {
      width: 220,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    storeBadge: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    storeBadgeText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0f1113',
    },
    productContent: {
      gap: 8,
    },
    productBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.accentSoft,
    },
    productBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    productTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    productSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    productFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    productPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accentStrong,
    },
    productStoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: 120,
    },
    productStoreName: {
      fontSize: 12,
      color: colors.textMuted,
    },
    productTagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    productTagChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    productTagText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });

export default CommercialScreen;
