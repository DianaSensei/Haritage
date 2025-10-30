import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/core/config';
import { useCartStore } from '@/core/store';
import { CartQuantityControls } from '@/modules/commercial/components/CartQuantityControls';
import {
    mockSectionItems,
    mockStoreFronts,
} from '@/modules/commercial/data/mockStores';
import type {
    CartItem,
    CommercialSection,
    CommercialSectionItem,
    StoreFront,
} from '@/modules/commercial/types';
import { formatPriceFromCents, parsePriceToCents } from '@/modules/commercial/utils/price';
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

const useSafeTabBarHeight = (fallback: number) => {
  const hasWarnedRef = useRef(false);

  try {
    return useBottomTabBarHeight();
  } catch (error) {
    if (__DEV__ && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      console.warn('[CommercialScreen] Falling back to safe-area inset for tab bar height.', error);
    }

    return fallback;
  }
};

export const CommercialScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const tabBarHeight = useSafeTabBarHeight(insets.bottom);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isCartExpanded, setCartExpanded] = useState<boolean>(false);

  const cartItemsMap = useCartStore((state) => state.items);
  const totalQuantity = useCartStore((state) => state.totalQuantity);
  const totalCents = useCartStore((state) => state.totalCents);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartItems = useMemo<CartItem[]>(
    () => Object.values(cartItemsMap) as CartItem[],
    [cartItemsMap],
  );
  const locale = i18n.language ?? 'en';
  const collapsedSheetSpace = 132;
  const expandedSheetSpace = Math.min(height * 0.55, 420);
  const baseBottomInset = useMemo(
    () => (tabBarHeight > 0 ? tabBarHeight : insets.bottom),
    [insets.bottom, tabBarHeight],
  );
  const cartSheetBottomOffset = baseBottomInset + 12;
  const contentPaddingBottom = useMemo(
    () =>
      totalQuantity > 0
        ? (isCartExpanded ? expandedSheetSpace : collapsedSheetSpace) + cartSheetBottomOffset
        : 32 + baseBottomInset,
    [baseBottomInset, cartSheetBottomOffset, expandedSheetSpace, isCartExpanded, totalQuantity],
  );

  useEffect(() => {
    if (totalQuantity === 0) {
      setCartExpanded(false);
    }
  }, [totalQuantity]);

  const handleToggleCart = useCallback(() => {
    setCartExpanded((prev) => !prev);
  }, []);

  const handleCheckoutPress = useCallback(() => {
    router.push('/checkout');
  }, [router]);

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
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
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

      {totalQuantity > 0 ? (
        <View style={[styles.cartSheetWrapper, { bottom: cartSheetBottomOffset, paddingBottom: 12 }]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.cartSheetContainer,
              isCartExpanded ? styles.cartSheetExpandedContainer : styles.cartSheetCollapsedContainer,
            ]}
          >
            <View style={styles.cartHandle} />
            <TouchableOpacity
              style={styles.cartHeaderRow}
              activeOpacity={0.85}
              onPress={handleToggleCart}
              accessibilityRole="button"
              accessibilityLabel={
                isCartExpanded ? t('commercial.cart.collapse') : t('commercial.cart.expand')
              }
            >
              <View style={{ flex: 1, gap: 4 }}>
                <ThemedText style={styles.cartHeaderText}>{t('commercial.cart.title')}</ThemedText>
                <ThemedText style={styles.cartSummaryText}>
                  {t('commercial.cart.summary', { count: totalQuantity })}
                </ThemedText>
              </View>
              <View style={styles.cartHeaderMeta}>
                <ThemedText style={styles.cartTotalText}>
                  {formatPriceFromCents(totalCents, locale, 'USD')}
                </ThemedText>
                <Ionicons
                  name={isCartExpanded ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color={colors.icon}
                />
              </View>
            </TouchableOpacity>

            {isCartExpanded ? (
              <>
                <View style={styles.cartDivider} />
                <ScrollView
                  style={styles.cartItemsScroll}
                  contentContainerStyle={styles.cartItemsList}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {cartItems.map((cartItem) => (
                    <View key={cartItem.id} style={styles.cartItemRow}>
                      {cartItem.imageUrl ? (
                        <Image
                          source={{ uri: cartItem.imageUrl }}
                          style={styles.cartItemImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.cartItemImageFallback}>
                          <Ionicons name="image" size={18} color={colors.iconMuted} />
                        </View>
                      )}
                      <View style={styles.cartItemInfo}>
                        <ThemedText style={styles.cartItemName} numberOfLines={1}>
                          {cartItem.name}
                        </ThemedText>
                        {cartItem.storeName ? (
                          <ThemedText style={styles.cartItemMeta} numberOfLines={1}>
                            {cartItem.storeName}
                          </ThemedText>
                        ) : null}
                        <ThemedText style={styles.cartItemMeta}>{cartItem.priceLabel}</ThemedText>
                      </View>
                      <View style={styles.cartItemRight}>
                        <ThemedText style={styles.cartItemLineTotal}>
                          {formatPriceFromCents(
                            cartItem.priceCents * cartItem.quantity,
                            locale,
                            'USD',
                          )}
                        </ThemedText>
                        <CartQuantityControls
                          id={cartItem.id}
                          name={cartItem.name}
                          priceCents={cartItem.priceCents}
                          priceLabel={cartItem.priceLabel}
                          imageUrl={cartItem.imageUrl}
                          storeId={cartItem.storeId}
                          storeName={cartItem.storeName}
                          accentColor={cartItem.accentColor}
                          variant="compact"
                          style={styles.cartItemControls}
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.cartFooter}>
                  <TouchableOpacity
                    style={styles.cartClearButton}
                    onPress={clearCart}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t('commercial.cart.clear')}
                  >
                    <ThemedText style={styles.cartClearLabel}>
                      {t('commercial.cart.clear')}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartCheckoutButton}
                    onPress={handleCheckoutPress}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel={t('commercial.cart.checkoutCta')}
                  >
                    <ThemedText style={styles.cartCheckoutLabel}>
                      {t('commercial.cart.checkoutCta')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      ) : null}
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

const ProductCard: React.FC<ProductCardProps> = ({ item, store, onPress, styles, colors }) => {
  const priceCents = useMemo(() => parsePriceToCents(item.price), [item.price]);

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.88}
      accessibilityRole="button"
      onPress={onPress}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
      ) : null}
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
        <View style={styles.productPriceRow}>
          <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
          <View style={styles.productStoreRow}>
            <Ionicons name="storefront" size={12} color={colors.iconMuted} />
            <ThemedText style={styles.productStoreName} numberOfLines={1}>
              {store.name}
            </ThemedText>
          </View>
        </View>
        <CartQuantityControls
          id={item.id}
          name={item.name}
          priceCents={priceCents}
          priceLabel={item.price}
          imageUrl={item.imageUrl}
          storeId={store.id}
          storeName={store.name}
          accentColor={item.accentColor}
          variant="compact"
          style={styles.productCartControls}
        />
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
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
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
    productImage: {
      width: '100%',
      height: 110,
      borderRadius: 12,
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
      gap: 12,
    },
    productPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
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
      flex: 1,
      maxWidth: 132,
    },
    productStoreName: {
      fontSize: 12,
      color: colors.textMuted,
    },
    productCartControls: {
      alignSelf: 'flex-start',
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
    cartSheetWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
    },
    cartSheetContainer: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
      gap: 16,
    },
    cartSheetCollapsedContainer: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      gap: 12,
    },
    cartSheetExpandedContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 16,
    },
    cartHandle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
    },
    cartHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    cartHeaderText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    cartSummaryText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    cartHeaderMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cartTotalText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    cartDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    cartItemsScroll: {
      maxHeight: 280,
    },
    cartItemsList: {
      gap: 16,
      paddingBottom: 4,
    },
    cartItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    cartItemImage: {
      width: 56,
      height: 56,
      borderRadius: 14,
    },
    cartItemImageFallback: {
      width: 56,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    cartItemInfo: {
      flex: 1,
      gap: 4,
    },
    cartItemName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemMeta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cartItemRight: {
      gap: 8,
      alignItems: 'flex-end',
    },
    cartItemLineTotal: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemControls: {
      alignSelf: 'flex-end',
    },
    cartFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cartClearButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    cartClearLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    cartCheckoutButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentStrong,
    },
    cartCheckoutLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background,
    },
  });

export default CommercialScreen;
