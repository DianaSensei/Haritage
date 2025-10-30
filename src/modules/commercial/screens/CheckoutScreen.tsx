import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mockCheckout } from '@/modules/commercial/data/mockCheckout';
import {
    CheckoutItem,
    FulfillmentMethod,
} from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

interface FulfillmentOption {
  key: FulfillmentMethod;
  icon: keyof typeof Ionicons.glyphMap;
  comingSoon?: boolean;
}

const BASE_FULFILLMENT_OPTIONS: FulfillmentOption[] = [
  { key: 'delivery', icon: 'bicycle-outline' },
  { key: 'pickup', icon: 'bag-handle-outline', comingSoon: true },
  { key: 'dine_in', icon: 'restaurant-outline', comingSoon: true },
];

export const CheckoutScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('delivery');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [storeNote, setStoreNote] = useState('');

  const checkout = mockCheckout;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language ?? 'en', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const fulfillmentOptions = useMemo(
    () =>
      BASE_FULFILLMENT_OPTIONS.map((option) => ({
        ...option,
        label: t(`commercial.checkout.fulfillment.options.${option.key}`),
      })),
    [t],
  );

  const activeFulfillment = useMemo(
    () => fulfillmentOptions.find((option) => option.key === fulfillment),
    [fulfillmentOptions, fulfillment],
  );

  const isComingSoon = activeFulfillment?.comingSoon ?? false;

  const formatMoney = useCallback(
    (cents: number) => currencyFormatter.format(cents / 100),
    [currencyFormatter],
  );

  const handleSelect = useCallback((key: FulfillmentMethod) => {
    setFulfillment(key);
  }, []);

  const renderItem = useCallback(
    (item: CheckoutItem) => (
      <View key={item.id} style={styles.itemRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemThumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.itemThumbnailPlaceholder}>
            <Ionicons name="image" size={18} color={colors.iconMuted} />
          </View>
        )}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <ThemedText style={styles.itemTitle}>{item.name}</ThemedText>
            <ThemedText style={styles.itemQuantity}>
              {item.quantity}
              {t('commercial.checkout.items.quantitySuffix')}
            </ThemedText>
          </View>
          <ThemedText style={styles.itemPrice}>{formatMoney(item.priceCents)}</ThemedText>
          {item.options?.length ? (
            <View style={styles.itemOptions}>
              {item.options.map((option) => (
                <ThemedText key={`${item.id}-${option.label}`} style={styles.itemOptionText}>
                  {t('commercial.checkout.items.optionsLabel', {
                    label: option.label,
                    value: option.value,
                  })}
                </ThemedText>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    ),
    [colors.iconMuted, formatMoney, styles, t],
  );

  const pricingRows = useMemo(
    () => [
      {
        key: 'subtotal',
        label: t('commercial.checkout.pricing.subtotal'),
        value: checkout.pricing.subtotalCents,
      },
      {
        key: 'shipping',
        label: t('commercial.checkout.pricing.shipping'),
        value: checkout.pricing.shippingCents,
      },
      {
        key: 'tax',
        label: t('commercial.checkout.pricing.tax'),
        value: checkout.pricing.taxCents,
      },
      checkout.pricing.discountCents
        ? {
            key: 'discount',
            label: t('commercial.checkout.pricing.discount'),
            value: -checkout.pricing.discountCents,
          }
        : null,
    ].filter(Boolean) as { key: string; label: string; value: number }[],
    [checkout.pricing.discountCents, checkout.pricing.shippingCents, checkout.pricing.subtotalCents, checkout.pricing.taxCents, t],
  );

  const getEtaLabel = useCallback(
    (method: FulfillmentMethod) => {
      if (method === 'delivery') {
        return t('commercial.checkout.delivery.eta', {
          minutes: checkout.expectedDeliveryMinutes,
        });
      }

      if (method === 'pickup') {
        return t('commercial.checkout.pickup.eta', {
          minutes: checkout.expectedPickupMinutes,
        });
      }

      return t('commercial.checkout.dineIn.eta', {
        minutes: checkout.expectedDineInMinutes,
      });
    },
    [checkout.expectedDeliveryMinutes, checkout.expectedDineInMinutes, checkout.expectedPickupMinutes, t],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>{t('commercial.checkout.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('commercial.checkout.subtitle')}</ThemedText>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.checkout.fulfillment.title')}</ThemedText>
            {isComingSoon ? (
              <ThemedText style={styles.comingSoonTag}>
                {t('commercial.checkout.fulfillment.comingSoon')}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.fulfillmentRow}>
            {fulfillmentOptions.map((option) => {
              const isActive = option.key === fulfillment;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.fulfillmentChip,
                    isActive ? styles.fulfillmentChipActive : null,
                  ]}
                  onPress={() => handleSelect(option.key)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Ionicons
                    name={option.icon}
                    size={16}
                    color={isActive ? colors.accentStrong : colors.iconMuted}
                  />
                  <ThemedText
                    style={isActive ? styles.fulfillmentLabelActive : styles.fulfillmentLabel}
                  >
                    {option.label}
                  </ThemedText>
                  {option.comingSoon ? (
                    <ThemedText style={styles.fulfillmentSoon}>
                      {t('commercial.checkout.fulfillment.comingSoon')}
                    </ThemedText>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {fulfillment === 'delivery' ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>
                {t('commercial.checkout.delivery.addressLabel')}
              </ThemedText>
            </View>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrapper}>
                <Ionicons name="location-outline" size={18} color={colors.accentStrong} />
              </View>
              <View style={styles.addressContent}>
                <ThemedText style={styles.addressLabel}>{checkout.deliveryAddress.label}</ThemedText>
                <ThemedText style={styles.addressDetail}>{checkout.deliveryAddress.detail}</ThemedText>
              </View>
            </View>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={16} color={colors.iconMuted} />
              <ThemedText style={styles.etaText}>{getEtaLabel('delivery')}</ThemedText>
            </View>
            <TextInput
              value={deliveryNote}
              onChangeText={setDeliveryNote}
              style={styles.textArea}
              placeholder={t('commercial.checkout.delivery.notePlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              accessibilityLabel={t('commercial.checkout.delivery.noteLabel')}
            />
            <ThemedText style={styles.sectionHelper}>
              {t('commercial.checkout.delivery.addressHint')}
            </ThemedText>
          </View>
        ) : null}

        {fulfillment === 'pickup' ? (
          <View style={[styles.sectionCard, isComingSoon ? styles.sectionCardDisabled : null]}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>
                {t('commercial.checkout.pickup.addressLabel')}
              </ThemedText>
            </View>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrapper}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.accentStrong} />
              </View>
              <View style={styles.addressContent}>
                <ThemedText style={styles.addressLabel}>{checkout.pickupAddress}</ThemedText>
                <ThemedText style={styles.addressDetail}>{checkout.storeName}</ThemedText>
              </View>
            </View>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={16} color={colors.iconMuted} />
              <ThemedText style={styles.etaText}>{getEtaLabel('pickup')}</ThemedText>
            </View>
            <TextInput
              value={pickupNote}
              onChangeText={setPickupNote}
              style={styles.textArea}
              placeholder={t('commercial.checkout.pickup.notePlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              editable={!isComingSoon}
              accessibilityLabel={t('commercial.checkout.pickup.noteLabel')}
            />
          </View>
        ) : null}

        {fulfillment === 'dine_in' ? (
          <View style={[styles.sectionCard, isComingSoon ? styles.sectionCardDisabled : null]}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>
                {t('commercial.checkout.dineIn.infoTitle')}
              </ThemedText>
            </View>
            <View style={styles.storeRow}>
              {checkout.storeLogoUrl ? (
                <Image source={{ uri: checkout.storeLogoUrl }} style={styles.storeLogo} />
              ) : (
                <View style={styles.storeLogoFallback}>
                  <Ionicons name="storefront" size={18} color={colors.iconMuted} />
                </View>
              )}
              <View style={styles.storeContent}>
                <ThemedText style={styles.storeName}>{checkout.storeName}</ThemedText>
                <ThemedText style={styles.addressDetail}>
                  {t('commercial.checkout.dineIn.locationLabel')}
                </ThemedText>
              </View>
            </View>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={16} color={colors.iconMuted} />
              <ThemedText style={styles.etaText}>{getEtaLabel('dine_in')}</ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.checkout.user.title')}</ThemedText>
          </View>
          <View style={styles.userRow}>
            <Ionicons name="person-circle-outline" size={28} color={colors.iconMuted} />
            <View style={styles.userContent}>
              <ThemedText style={styles.userName}>{checkout.user.name}</ThemedText>
              <ThemedText style={styles.userMeta}>{checkout.user.email}</ThemedText>
              <ThemedText style={styles.userMeta}>{checkout.user.phone}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.checkout.storeNote.title')}</ThemedText>
          </View>
          <TextInput
            value={storeNote}
            onChangeText={setStoreNote}
            style={styles.textArea}
            placeholder={t('commercial.checkout.storeNote.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.checkout.items.title')}</ThemedText>
            <ThemedText style={styles.sectionCounter}>
              {checkout.items.length}
            </ThemedText>
          </View>
          <View style={styles.itemsList}>
            {checkout.items.map(renderItem)}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.checkout.pricing.title')}</ThemedText>
          </View>
          <View style={styles.pricingRows}>
            {pricingRows.map((row) => (
              <View key={row.key} style={styles.pricingRow}>
                <ThemedText style={styles.pricingLabel}>{row.label}</ThemedText>
                <ThemedText style={styles.pricingValue}>
                  {row.value < 0 ? `- ${formatMoney(Math.abs(row.value))}` : formatMoney(row.value)}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.pricingTotalRow}>
            <ThemedText style={styles.pricingTotalLabel}>
              {t('commercial.checkout.pricing.total')}
            </ThemedText>
            <ThemedText style={styles.pricingTotalValue}>
              {formatMoney(checkout.pricing.totalCents)}
            </ThemedText>
          </View>
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
    scrollContent: {
      paddingBottom: 24,
    },
    headerSection: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    sectionCard: {
      marginHorizontal: 14,
      marginBottom: 14,
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 7,
      elevation: 1,
    },
    sectionCardDisabled: {
      opacity: 0.7,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    sectionCounter: {
      fontSize: 12,
      color: colors.textMuted,
    },
    sectionHelper: {
      fontSize: 10,
      color: colors.textMuted,
    },
    fulfillmentRow: {
      flexDirection: 'row',
      gap: 8,
    },
    fulfillmentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    fulfillmentChipActive: {
      borderColor: colors.accentStrong,
      backgroundColor: colors.accentSoft,
    },
    fulfillmentLabel: {
      fontSize: 12,
      color: colors.text,
    },
    fulfillmentLabelActive: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    fulfillmentSoon: {
      fontSize: 10,
      color: colors.textMuted,
    },
    comingSoonTag: {
      fontSize: 11,
      color: colors.warning,
      fontWeight: '600',
    },
    addressRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
    },
    addressIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    addressContent: {
      flex: 1,
      gap: 3,
    },
    addressLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    addressDetail: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    etaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    etaText: {
      fontSize: 11,
      color: colors.text,
    },
    textArea: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.text,
      fontSize: 12,
      lineHeight: 16,
      textAlignVertical: 'top',
    },
    storeRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    storeLogo: {
      width: 40,
      height: 40,
      borderRadius: 10,
    },
    storeLogoFallback: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    storeContent: {
      flex: 1,
      gap: 2,
    },
    storeName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    userRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    userContent: {
      gap: 3,
    },
    userName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    userMeta: {
      fontSize: 11,
      color: colors.textMuted,
    },
    itemsList: {
      gap: 12,
    },
    itemRow: {
      flexDirection: 'row',
      gap: 10,
    },
    itemThumbnail: {
      width: 54,
      height: 54,
      borderRadius: 12,
    },
    itemThumbnailPlaceholder: {
      width: 54,
      height: 54,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    itemContent: {
      flex: 1,
      gap: 5,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginRight: 8,
    },
    itemQuantity: {
      fontSize: 11,
      color: colors.textMuted,
    },
    itemPrice: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    itemOptions: {
      gap: 2,
    },
    itemOptionText: {
      fontSize: 10,
      color: colors.textMuted,
    },
    pricingRows: {
      gap: 6,
    },
    pricingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pricingLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    pricingValue: {
      fontSize: 12,
      color: colors.text,
    },
    pricingTotalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 2,
    },
    pricingTotalLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    pricingTotalValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
  });

export default CheckoutScreen;
