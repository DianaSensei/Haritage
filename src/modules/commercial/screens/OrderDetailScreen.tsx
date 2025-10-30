import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderStatusProgress } from '@/modules/commercial/components/OrderStatusProgress';
import { mockOrderDetail } from '@/modules/commercial/data/mockOrderDetail';
import type { OrderDetail, OrderProgressStatus } from '@/modules/commercial/types';
import { formatPriceFromCents } from '@/modules/commercial/utils/price';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const STATUS_SEQUENCE: OrderProgressStatus[] = [
  'init',
  'order_received',
  'in_process',
  'in_delivery',
  'complete',
  'cancelled',
  'fail',
];

const formatTimestamp = (timestamp: string | null, locale: string) => {
  if (!timestamp) {
    return undefined;
  }
  const date = new Date(timestamp);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatPlacedAt = (timestamp: string, locale: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

interface OrderDetailScreenProps {
  order?: OrderDetail;
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ order = mockOrderDetail }) => {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locale = i18n.language ?? 'en';

  const timeline = useMemo(
    () => order.timeline.filter((entry) => STATUS_SEQUENCE.includes(entry.status)),
    [order.timeline],
  );

  const currentStatus = useMemo(() => {
    const lastCompleted = [...timeline].reverse().find((step) => step.timestamp !== null);
    const nextPending = timeline.find((step) => step.timestamp === null);
    if (lastCompleted && ['complete', 'cancelled', 'fail'].includes(lastCompleted.status)) {
      return lastCompleted.status;
    }
    return nextPending?.status ?? lastCompleted?.status ?? 'init';
  }, [timeline]);

  const resolveStatusLabel = (status: OrderProgressStatus) =>
    t(`commercial.orderDetail.statusLabels.${status}`);

  const currency = order.paymentSummary.currency;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
          style={styles.headerIconButton}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={18} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('commercial.orderDetail.title')}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <ThemedText style={styles.orderNumber}>#{order.orderNumber}</ThemedText>
            <ThemedText style={styles.orderStatus}>{resolveStatusLabel(currentStatus)}</ThemedText>
          </View>
          <ThemedText style={styles.timestamp}>{formatPlacedAt(order.placedAt, locale)}</ThemedText>
          <View style={styles.storeRow}>
            {order.store.logoUrl ? (
              <Image source={{ uri: order.store.logoUrl }} style={styles.storeLogo} resizeMode="cover" />
            ) : (
              <View style={[styles.storeLogo, styles.storeLogoFallback]}>
                <Ionicons name="storefront" size={16} color={colors.iconMuted} />
              </View>
            )}
            <View style={styles.storeMeta}>
              <ThemedText style={styles.storeName}>{order.store.name}</ThemedText>
              <ThemedText style={styles.fulfillmentText}>
                {t(`commercial.orderDetail.fulfillment.${order.fulfillmentMethod}`)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.progress.title')}</ThemedText>
          <OrderStatusProgress
            timeline={timeline}
            labelForStatus={resolveStatusLabel}
            timeForStatus={(status, timestamp) => formatTimestamp(timestamp, locale)}
          />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.items.title')}</ThemedText>
          <View style={styles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  {item.options?.map((option) => (
                    <ThemedText key={`${item.id}-${option.label}`} style={styles.itemOption}>
                      {t('commercial.orderDetail.items.optionLabel', {
                        label: option.label,
                        value: option.value,
                      })}
                    </ThemedText>
                  ))}
                </View>
                <View style={styles.itemMeta}>
                  <ThemedText style={styles.itemQuantity}>
                    {t('commercial.orderDetail.items.quantity', { count: item.quantity })}
                  </ThemedText>
                  <ThemedText style={styles.itemPrice}>
                    {formatPriceFromCents(item.priceCents, locale, currency)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.payment.title')}</ThemedText>
          <View style={styles.paymentMetaRow}>
            <Ionicons name="card-outline" size={16} color={colors.iconMuted} />
            <ThemedText style={styles.paymentValue}>{order.paymentSummary.method}</ThemedText>
            <View style={styles.paymentStatusPill}>
              <ThemedText style={styles.paymentStatusText}>
                {t(`commercial.orderDetail.payment.status.${order.paymentSummary.status}`)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.pricingRows}>
            <View style={styles.pricingRow}>
              <ThemedText style={styles.pricingLabel}>{t('commercial.orderDetail.payment.subtotal')}</ThemedText>
              <ThemedText style={styles.pricingValue}>
                {formatPriceFromCents(order.pricing.subtotalCents, locale, currency)}
              </ThemedText>
            </View>
            <View style={styles.pricingRow}>
              <ThemedText style={styles.pricingLabel}>{t('commercial.orderDetail.payment.delivery')}</ThemedText>
              <ThemedText style={styles.pricingValue}>
                {formatPriceFromCents(order.pricing.shippingCents, locale, currency)}
              </ThemedText>
            </View>
            <View style={styles.pricingRow}>
              <ThemedText style={styles.pricingLabel}>{t('commercial.orderDetail.payment.tax')}</ThemedText>
              <ThemedText style={styles.pricingValue}>
                {formatPriceFromCents(order.pricing.taxCents, locale, currency)}
              </ThemedText>
            </View>
            {order.pricing.discountCents ? (
              <View style={styles.pricingRow}>
                <ThemedText style={styles.pricingLabel}>{t('commercial.orderDetail.payment.discount')}</ThemedText>
                <ThemedText style={[styles.pricingValue, styles.pricingDiscount]}>
                  -{formatPriceFromCents(order.pricing.discountCents, locale, currency)}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <View style={styles.pricingTotalRow}>
            <ThemedText style={styles.pricingTotalLabel}>{t('commercial.orderDetail.payment.total')}</ThemedText>
            <ThemedText style={styles.pricingTotalValue}>
              {formatPriceFromCents(order.pricing.totalCents, locale, currency)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.contact.title')}</ThemedText>
          <View style={styles.contactRow}>
            <Ionicons name="person-circle" size={20} color={colors.icon} />
            <View style={styles.contactMeta}>
              <ThemedText style={styles.contactName}>{order.contact.name}</ThemedText>
              <ThemedText style={styles.contactValue}>{order.contact.email}</ThemedText>
              <ThemedText style={styles.contactValue}>{order.contact.phone}</ThemedText>
            </View>
          </View>
        </View>

        {order.deliveryAddress ? (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.delivery.title')}</ThemedText>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color={colors.iconMuted} />
              <View style={styles.addressMeta}>
                <ThemedText style={styles.addressLabel}>{order.deliveryAddress.label}</ThemedText>
                <ThemedText style={styles.addressDetail}>{order.deliveryAddress.detail}</ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {order.pickupAddress ? (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.pickup.title')}</ThemedText>
            <View style={styles.addressRow}>
              <Ionicons name="bag-handle-outline" size={16} color={colors.iconMuted} />
              <View style={styles.addressMeta}>
                <ThemedText style={styles.addressDetail}>{order.pickupAddress}</ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {order.dineInLocation ? (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.dineIn.title')}</ThemedText>
            <View style={styles.addressRow}>
              <Ionicons name="restaurant-outline" size={16} color={colors.iconMuted} />
              <View style={styles.addressMeta}>
                <ThemedText style={styles.addressDetail}>{order.dineInLocation}</ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {order.statusNotes ? (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('commercial.orderDetail.notes.title')}</ThemedText>
            <ThemedText style={styles.notesText}>{order.statusNotes}</ThemedText>
          </View>
        ) : null}
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
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    headerIconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    headerSpacer: {
      width: 32,
      height: 32,
    },
    content: {
      paddingHorizontal: 14,
      paddingBottom: 24,
      gap: 14,
    },
    card: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    orderStatus: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accentStrong,
    },
    timestamp: {
      fontSize: 11,
      color: colors.textMuted,
    },
    storeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    storeLogo: {
      width: 40,
      height: 40,
      borderRadius: 12,
    },
    storeLogoFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    storeMeta: {
      flex: 1,
      gap: 2,
    },
    storeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    fulfillmentText: {
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    itemsList: {
      gap: 12,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    itemInfo: {
      flex: 1,
      gap: 2,
    },
    itemName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    itemOption: {
      fontSize: 10,
      color: colors.textMuted,
    },
    itemMeta: {
      alignItems: 'flex-end',
      gap: 4,
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
    paymentMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    paymentValue: {
      fontSize: 12,
      color: colors.text,
      flex: 1,
    },
    paymentStatusPill: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: colors.accentSoft,
    },
    paymentStatusText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.accentStrong,
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
      fontSize: 11,
      color: colors.textMuted,
    },
    pricingValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    pricingDiscount: {
      color: colors.warning,
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
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    pricingTotalValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    contactMeta: {
      flex: 1,
      gap: 2,
    },
    contactName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    contactValue: {
      fontSize: 11,
      color: colors.textMuted,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    addressMeta: {
      flex: 1,
      gap: 2,
    },
    addressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    addressDetail: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 16,
    },
    notesText: {
      fontSize: 11,
      color: colors.text,
      lineHeight: 16,
    },
  });
