import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartStore } from '@/core/store';
import { CartQuantityControls } from '@/modules/commercial/components/CartQuantityControls';
import {
    mockStoreFronts,
} from '@/modules/commercial/data/mockStores';
import type { CartItem, StoreFront } from '@/modules/commercial/types';
import { formatPriceFromCents, parsePriceToCents } from '@/modules/commercial/utils/price';
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
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const tabBarHeight = useMemo(() => 56 + Math.max(insets.bottom - 8, 0), [insets.bottom]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [isCartExpanded, setCartExpanded] = useState(false);

  const cartItemsMap = useCartStore((state) => state.items);
  const totalQuantity = useCartStore((state) => state.totalQuantity);
  const totalCents = useCartStore((state) => state.totalCents);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartItems = useMemo<CartItem[]>(
    () => Object.values(cartItemsMap) as CartItem[],
    [cartItemsMap],
  );

  const locale = i18n.language ?? 'en';
  const collapsedSheetSpace = 110;
  const expandedSheetSpace = Math.min(height * 0.5, 400);
  const baseBottomInset = tabBarHeight;
  const cartSheetBottomOffset = baseBottomInset + 10;
  const contentPaddingBottom = useMemo(
    () =>
      totalQuantity > 0
        ? (isCartExpanded ? expandedSheetSpace : collapsedSheetSpace) + cartSheetBottomOffset
        : 24 + baseBottomInset,
    [baseBottomInset, cartSheetBottomOffset, collapsedSheetSpace, expandedSheetSpace, isCartExpanded, totalQuantity],
  );

  useEffect(() => {
    if (totalQuantity === 0) {
      setCartExpanded(false);
    }
  }, [totalQuantity]);

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

  const handleToggleCart = useCallback(() => {
    setCartExpanded((prev) => !prev);
  }, []);

  const handleCheckoutPress = useCallback(() => {
    router.push('/checkout');
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
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
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

          {store.galleryImages?.length ? (
            <View style={styles.gallerySection}>
              <SectionHeader title={t('commercial.storeInfo.galleryTitle')} styles={styles} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {store.galleryImages.map((image, index) => (
                  <Image key={`${index}-${image}`} source={{ uri: image }} style={styles.galleryImage} />
                ))}
              </ScrollView>
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
                {category.coverImageUrl ? (
                  <Image source={{ uri: category.coverImageUrl }} style={styles.categoryImage} resizeMode="cover" />
                ) : null}
                <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                <View style={styles.categoryList}>
                  {category.items.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                      <View
                        pointerEvents="none"
                        style={[
                          styles.productCardHighlight,
                          {
                            backgroundColor: store.accentColor,
                            opacity: isDark ? 0.12 : 0.08,
                          },
                        ]}
                      />
                      <View style={styles.productImageFrame}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
                        ) : (
                          <View style={styles.productImageFallback}>
                            <Ionicons name="image" size={20} color={colors.iconMuted} />
                          </View>
                        )}
                      </View>
                      <View style={styles.productContent}>
                        <ThemedText style={styles.productName} numberOfLines={2}>
                          {item.name}
                        </ThemedText>
                        {item.description ? (
                          <ThemedText style={styles.productDescription} numberOfLines={2}>
                            {item.description}
                          </ThemedText>
                        ) : null}
                      </View>
                      <View style={styles.productFooter}>
                        <View style={styles.productPriceTag}>
                          <ThemedText style={styles.productPriceText}>{item.price}</ThemedText>
                        </View>
                        <CartQuantityControls
                          id={item.id}
                          name={item.name}
                          priceCents={parsePriceToCents(item.price)}
                          priceLabel={item.price}
                          imageUrl={item.imageUrl}
                          storeId={store.id}
                          storeName={store.name}
                          accentColor={store.accentColor}
                          variant="compact"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {totalQuantity > 0 ? (
        <View
          style={[styles.cartSheetWrapper, { bottom: cartSheetBottomOffset, paddingBottom: 8 }]}
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

const createStyles = (
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDark: boolean,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    bannerWrapper: {
      position: 'relative',
      height: 150,
      marginBottom: 16,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 6 : 8 },
      shadowOpacity: isDark ? 0.08 : 0.12,
      shadowRadius: isDark ? 14 : 24,
      elevation: 6,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 14,
      left: 14,
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accent : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.12 : 0.2,
      shadowRadius: isDark ? 8 : 14,
      elevation: 4,
    },
    contentWrapper: {
      paddingHorizontal: 16,
      gap: 18,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoImage: {
      width: 54,
      height: 54,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    logoFallback: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    logoFallbackText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    titleBlock: {
      flex: 1,
      gap: 6,
    },
    storeName: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
    },
    storeCategory: {
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    promoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 10,
      borderRadius: 16,
      backgroundColor: isDark ? colors.accentSoft : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accent : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 2 : 8 },
      shadowOpacity: isDark ? 0.08 : 0.14,
      shadowRadius: isDark ? 10 : 26,
      elevation: 4,
    },
    promoText: {
      flex: 1,
      fontSize: 11,
      color: colors.accentStrong,
    },
    gallerySection: {
      gap: 8,
    },
    galleryScroll: {
      gap: 8,
      paddingRight: 2,
    },
    galleryImage: {
      width: 128,
      height: 92,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.surfaceSecondary : colors.borderMuted,
    },
    statRow: {
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'space-between',
    },
    statPill: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      gap: 3,
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 3 : 9 },
      shadowOpacity: isDark ? 0.08 : 0.14,
      shadowRadius: isDark ? 12 : 32,
      elevation: 5,
    },
    statIconWrapper: {
      width: 20,
      height: 20,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.accentSoft : colors.highlight,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
    sectionHeader: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    infoSection: {
      gap: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 3 : 9 },
      shadowOpacity: isDark ? 0.08 : 0.14,
      shadowRadius: isDark ? 14 : 34,
      elevation: 5,
    },
    description: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    categoryWrapper: {
      gap: 14,
    },
    categoryBlock: {
      gap: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor: isDark ? colors.surface : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 4 : 10 },
      shadowOpacity: isDark ? 0.1 : 0.16,
      shadowRadius: isDark ? 16 : 38,
      elevation: 6,
    },
    categoryImage: {
      width: '100%',
      height: 112,
      borderRadius: 10,
    },
    categoryTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'space-between',
    },
    productCard: {
      flexBasis: '48%',
      maxWidth: '48%',
      backgroundColor: isDark ? colors.surface : colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? colors.accentSoft : colors.borderMuted,
      overflow: 'hidden',
      padding: 12,
      gap: 12,
      minHeight: 210,
      justifyContent: 'space-between',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? 5 : 11 },
      shadowOpacity: isDark ? 0.1 : 0.17,
      shadowRadius: isDark ? 14 : 34,
      elevation: 5,
    },
    productCardHighlight: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0,
    },
    productImageFrame: {
      width: '100%',
      height: 112,
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
    productImageFallback: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    productContent: {
      gap: 5,
      flex: 1,
    },
    productName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    productDescription: {
      fontSize: 10,
      color: colors.textMuted,
      lineHeight: 15,
    },
    productFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border : colors.borderMuted,
      paddingTop: 8,
    },
    productPriceTag: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderMuted,
    },
    productPriceText: {
      fontSize: 11,
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
    cartSheetWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      paddingHorizontal: 14,
    },
    cartSheetContainer: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderMuted,
      backgroundColor: isDark ? colors.surface : colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: isDark ? -1 : 6 },
      shadowOpacity: isDark ? 0.12 : 0.18,
      shadowRadius: isDark ? 16 : 40,
      elevation: 7,
      overflow: 'hidden',
      gap: 12,
    },
    cartSheetCollapsedContainer: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 10,
    },
    cartSheetExpandedContainer: {
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 12,
      gap: 14,
    },
    cartHandle: {
      alignSelf: 'center',
      width: 32,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.borderMuted,
    },
    cartHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    cartHeaderText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    cartSummaryText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cartHeaderMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cartTotalText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    cartDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
    },
    cartItemsScroll: {
      maxHeight: 240,
    },
    cartItemsList: {
      gap: 14,
      paddingBottom: 4,
    },
    cartItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    cartItemImage: {
      width: 52,
      height: 52,
      borderRadius: 14,
    },
    cartItemImageFallback: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    cartItemInfo: {
      flex: 1,
      gap: 4,
    },
    cartItemName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemMeta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cartItemRight: {
      gap: 6,
      alignItems: 'flex-end',
    },
    cartItemLineTotal: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    cartItemControls: {
      alignSelf: 'flex-end',
    },
    cartFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    cartClearButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surfaceSecondary : colors.cardMuted,
    },
    cartClearLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    cartCheckoutButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentStrong,
    },
    cartCheckoutLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.background,
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
    <View style={styles.statPill}>
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
