import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
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
const FALLBACK_TAB_BAR_HEIGHT = 56;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const CommercialScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
  const collapsedSheetSpace = 60;
  const expandedSheetSpace = Math.min(height * 0.48, 360);
  const effectiveTabBarHeight = FALLBACK_TAB_BAR_HEIGHT;
  const cartSheetBottomOffset = effectiveTabBarHeight + Math.max(insets.bottom - 10, 6);
  const contentPaddingBottom = useMemo(
    () =>
      totalQuantity > 0
        ? (isCartExpanded ? expandedSheetSpace : collapsedSheetSpace) + cartSheetBottomOffset
        : 24 + cartSheetBottomOffset,
    [cartSheetBottomOffset, collapsedSheetSpace, expandedSheetSpace, isCartExpanded, totalQuantity],
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
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.headerSection}>
              <ThemedText style={styles.title}>{t('commercial.title')}</ThemedText>
              <ThemedText style={styles.subtitle}>{t('commercial.subtitle')}</ThemedText>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles-outline" size={16} color={colors.accentStrong} />
              <ThemedText style={styles.heroBadgeText}>
                {t('commercial.sections.forYou.title')}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchRow, styles.heroSearchRow]}
            activeOpacity={0.85}
            onPress={handleSearchPress}
            accessibilityRole="search"
            accessibilityLabel={t('commercial.searchPlaceholder')}
          >
            <Ionicons name="search" size={18} color={colors.accentStrong} />
            <ThemedText style={styles.searchPlaceholder} numberOfLines={1}>
              {t('commercial.searchPlaceholder')}
            </ThemedText>
            <Ionicons name="arrow-forward" size={16} color={colors.accentStrong} />
          </TouchableOpacity>
        </View>

        {sections.map((section) => {
          const items = mockSectionItems[section.key];
          if (!items || items.length === 0) {
            return null;
          }

          return (
            <View key={section.key} style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWrap}>
                  <View style={styles.sectionAccentDot} />
                  <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.accentStrong} />
              </View>
              {section.subtitle ? (
                <ThemedText style={styles.sectionSubtitle}>{section.subtitle}</ThemedText>
              ) : null}

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
        <View
          style={[styles.cartSheetWrapper, { bottom: cartSheetBottomOffset }]}
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
  const accentColor = item.accentColor ?? colors.accentSoft;
  const scale = useRef(new Animated.Value(1)).current;
  const halo = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 22,
        bounciness: 5,
      }),
      Animated.timing(halo, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [halo, scale]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 8,
      }),
      Animated.timing(halo, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [halo, scale]);

  const haloOpacity = useMemo(
    () =>
      halo.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.2],
      }),
    [halo],
  );

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.productCard,
        styles.productCardRaised,
        { borderColor: accentColor, transform: [{ scale }] },
      ]}
      activeOpacity={0.88}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.productHalo,
          {
            backgroundColor: accentColor,
            opacity: haloOpacity,
          },
        ]}
      />
      <View style={[styles.productAccentBar, { backgroundColor: accentColor }]} />
      <View style={styles.productImageFrame}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image" size={18} color={colors.iconMuted} />
          </View>
        )}
      </View>
      <View style={[styles.storeBadge, item.accentColor ? { backgroundColor: item.accentColor } : null]}>
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
    </AnimatedTouchableOpacity>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 12,
      paddingTop: 12,
      gap: 18,
    },
    heroCard: {
      padding: 18,
      borderRadius: 22,
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      gap: 18,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 4 : 10 },
      shadowOpacity: isDark ? 0.09 : 0.14,
      shadowRadius: isDark ? 18 : 38,
      elevation: 6,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerSection: {
      gap: 4,
      paddingTop: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Fonts.sans,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderMuted,
    },
    heroSearchRow: {
      borderColor: colors.accent,
      backgroundColor: isDark ? colors.accentSoft : colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 2 : 6 },
      shadowOpacity: isDark ? 0.08 : 0.13,
      shadowRadius: isDark ? 6 : 18,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: isDark ? colors.accentSoft : colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: isDark ? colors.accent : colors.borderMuted,
    },
    heroBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    sectionBlock: {
      gap: 14,
      padding: 18,
      borderRadius: 22,
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.surfaceSecondary : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 4 : 10 },
      shadowOpacity: isDark ? 0.08 : 0.14,
      shadowRadius: isDark ? 16 : 40,
      elevation: 6,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    sectionAccentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    sectionHeader: {
      gap: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    productRow: {
      flexDirection: 'row',
      gap: 14,
      paddingRight: 6,
      paddingVertical: 4,
    },
    productCard: {
      width: 196,
      padding: 16,
      borderRadius: 20,
      backgroundColor: isDark ? colors.surface : colors.card,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderMuted,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 4 : 10 },
      shadowOpacity: isDark ? 0.08 : 0.14,
      shadowRadius: isDark ? 14 : 36,
      elevation: 6,
      overflow: 'hidden',
    },
    productCardRaised: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 6 : 12 },
      shadowOpacity: isDark ? 0.12 : 0.18,
      shadowRadius: isDark ? 20 : 42,
      elevation: 7,
    },
    productHalo: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0,
    },
    productAccentBar: {
      width: '100%',
      height: 4,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },
    productImageFrame: {
      width: '100%',
      height: 96,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderMuted,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    productImagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    storeBadge: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 2 : 4 },
      shadowOpacity: isDark ? 0.1 : 0.18,
      shadowRadius: isDark ? 6 : 14,
      elevation: 3,
    },
    storeBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#0f1113',
    },
    productContent: {
      gap: 5,
    },
    productBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
      backgroundColor: isDark ? colors.accentSoft : colors.cardMuted,
    },
    productBadgeText: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    productTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    productSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    productFooter: {
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border : colors.borderMuted,
      paddingTop: 10,
    },
    productPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    productPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accentStrong,
    },
    productStoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
      maxWidth: 112,
    },
    productStoreName: {
      fontSize: 10,
      color: colors.textMuted,
    },
    productCartControls: {
      alignSelf: 'flex-start',
    },
    productTagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    productTagChip: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 7,
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    productTagText: {
      fontSize: 9,
      color: colors.textMuted,
    },
    cartSheetWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 14,
      paddingBottom: 6,
      zIndex: 10,
      elevation: 10,
    },
    cartSheetContainer: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      backgroundColor: isDark ? colors.surface : colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? -1 : 6 },
      shadowOpacity: isDark ? 0.1 : 0.16,
      shadowRadius: isDark ? 16 : 40,
      elevation: 6,
      overflow: 'hidden',
      gap: 10,
    },
    cartSheetCollapsedContainer: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 6,
    },
    cartSheetExpandedContainer: {
      paddingHorizontal: 12,
      paddingTop: 9,
      paddingBottom: 10,
      gap: 12,
    },
    cartHandle: {
      alignSelf: 'center',
      width: 24,
      height: 3,
      borderRadius: 999,
      backgroundColor: colors.borderMuted,
    },
    cartHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    cartHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    cartSummaryText: {
      fontSize: 10,
      color: colors.textMuted,
    },
    cartHeaderMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cartTotalText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    cartDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
    },
    cartItemsScroll: {
      maxHeight: 200,
    },
    cartItemsList: {
      gap: 10,
      paddingBottom: 4,
    },
    cartItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    cartItemImage: {
      width: 42,
      height: 42,
      borderRadius: 11,
    },
    cartItemImageFallback: {
      width: 42,
      height: 42,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    cartItemInfo: {
      flex: 1,
      gap: 2,
    },
    cartItemName: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemMeta: {
      fontSize: 11,
      color: colors.textMuted,
    },
    cartItemRight: {
      gap: 4,
      alignItems: 'flex-end',
    },
    cartItemLineTotal: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemControls: {
      alignSelf: 'flex-end',
    },
    cartFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cartClearButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    cartClearLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
    },
    cartCheckoutButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentStrong,
    },
    cartCheckoutLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.background,
    },
  });

export default CommercialScreen;
