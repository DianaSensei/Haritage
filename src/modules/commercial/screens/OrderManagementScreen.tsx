import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mockOrders } from '@/modules/commercial/data/mockOrders';
import { OrderStatus, StoreOrder } from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const STATUS_SEQUENCE: OrderStatus[] = ['pending', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'];

type DateFilterKey = 'all' | '7' | '30' | '90';
type StatusFilterKey = 'all' | OrderStatus;

type StatusMeta = Record<
  OrderStatus,
  {
    label: string;
    background: string;
    color: string;
  }
>;

type DateOption = {
  key: DateFilterKey;
  label: string;
  days?: number;
};

type StatusOption = {
  key: StatusFilterKey;
  label: string;
};

export const OrderManagementScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('30');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language ?? 'en', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language ?? 'en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [i18n.language],
  );

  const dateOptions = useMemo<DateOption[]>(
    () => [
      { key: 'all', label: t('commercial.orders.filters.date.all') },
      { key: '7', label: t('commercial.orders.filters.date.seven'), days: 7 },
      { key: '30', label: t('commercial.orders.filters.date.thirty'), days: 30 },
      { key: '90', label: t('commercial.orders.filters.date.ninety'), days: 90 },
    ],
    [t],
  );

  const statusOptions = useMemo<StatusOption[]>(
    () => [
      { key: 'all', label: t('commercial.orders.filters.status.all') },
      ...STATUS_SEQUENCE.map((status) => ({
        key: status,
        label: t(`commercial.orders.statuses.${status}`),
      })),
    ],
    [t],
  );

  const statusMeta = useMemo<StatusMeta>(
    () => ({
      pending: {
        label: t('commercial.orders.statuses.pending'),
        background: colors.warningSoft,
        color: colors.warning,
      },
      processing: {
        label: t('commercial.orders.statuses.processing'),
        background: colors.infoSoft,
        color: colors.info,
      },
      ready: {
        label: t('commercial.orders.statuses.ready'),
        background: colors.accentSoft,
        color: colors.accentStrong,
      },
      shipped: {
        label: t('commercial.orders.statuses.shipped'),
        background: colors.infoSoft,
        color: colors.info,
      },
      delivered: {
        label: t('commercial.orders.statuses.delivered'),
        background: colors.successSoft,
        color: colors.success,
      },
      cancelled: {
        label: t('commercial.orders.statuses.cancelled'),
        background: colors.dangerSoft,
        color: colors.danger,
      },
    }),
    [colors, t],
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const selectedDateOption = dateOptions.find((option) => option.key === dateFilter);
    const maxDays = selectedDateOption?.days;
    const now = new Date().getTime();

    return mockOrders
      .filter((order) => {
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }

        if (maxDays != null) {
          const createdTime = new Date(order.createdAt).getTime();
          if (Number.isNaN(createdTime)) {
            return false;
          }
          const diffInDays = (now - createdTime) / (1000 * 60 * 60 * 24);
          if (diffInDays > maxDays) {
            return false;
          }
        }

        if (!normalizedQuery) {
          return true;
        }

        const storeMatch = order.storeName.toLowerCase().includes(normalizedQuery);
        const orderMatch = order.orderNumber.toLowerCase().includes(normalizedQuery);
        const itemMatch = order.items.some((item) => item.name.toLowerCase().includes(normalizedQuery));

        return storeMatch || orderMatch || itemMatch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, statusFilter, dateOptions, dateFilter]);

  const handleChangeStatus = useCallback((value: StatusFilterKey) => {
    setStatusFilter((current) => (current === value ? 'all' : value));
  }, []);

  const renderOrder = useCallback(
    ({ item }: { item: StoreOrder }) => (
      <OrderCard
        order={item}
        styles={styles}
        statusMeta={statusMeta}
        currencyFormatter={currencyFormatter}
        dateFormatter={dateFormatter}
        colors={colors}
        t={t}
      />
    ),
    [colors, currencyFormatter, dateFormatter, statusMeta, styles, t],
  );

  const keyExtractor = useCallback((item: StoreOrder) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.headerSection}>
        <ThemedText style={styles.title}>{t('commercial.orders.title')}</ThemedText>
        <ThemedText style={styles.subtitle}>{t('commercial.orders.subtitle')}</ThemedText>

        <View style={styles.filtersBlock}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color={colors.iconMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholder={t('commercial.orders.filters.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              accessibilityRole="search"
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel={t('commercial.orders.filters.clearSearch')}
              >
                <Ionicons name="close" size={16} color={colors.iconMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>{t('commercial.orders.filters.date.label')}</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              {dateOptions.map((option) => {
                const isActive = option.key === dateFilter;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setDateFilter(option.key)}
                    style={[
                      styles.filterChip,
                      isActive ? styles.filterChipActive : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <ThemedText
                      style={isActive ? styles.filterChipTextActive : styles.filterChipText}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>{t('commercial.orders.filters.status.label')}</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              {statusOptions.map((option) => {
                const isActive = option.key === statusFilter;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => handleChangeStatus(option.key)}
                    style={[
                      styles.filterChip,
                      isActive ? styles.filterChipActive : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <ThemedText
                      style={isActive ? styles.filterChipTextActive : styles.filterChipText}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    ),
    [colors, dateFilter, dateOptions, handleChangeStatus, searchQuery, statusFilter, statusOptions, styles, t],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredOrders}
        keyExtractor={keyExtractor}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={22} color={colors.iconMuted} />
            <ThemedText style={styles.emptyTitle}>{t('commercial.orders.empty.title')}</ThemedText>
            <ThemedText style={styles.emptySubtitle}>{t('commercial.orders.empty.subtitle')}</ThemedText>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

interface OrderCardProps {
  order: StoreOrder;
  styles: ReturnType<typeof createStyles>;
  statusMeta: StatusMeta;
  currencyFormatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
  colors: ReturnType<typeof useAppTheme>['colors'];
  t: (key: string, options?: Record<string, unknown>) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, styles, statusMeta, currencyFormatter, dateFormatter, colors, t }) => {
  const createdDate = new Date(order.createdAt);
  const formattedDate = Number.isNaN(createdDate.getTime()) ? order.createdAt : dateFormatter.format(createdDate);
  const formattedAmount = currencyFormatter.format(order.amountCents / 100);
  const itemsPreview = order.items.slice(0, 2).map((item) => item.name).join(', ');
  const hasMoreItems = order.items.length > 2;
  const additionalCount = hasMoreItems ? order.items.length - 2 : 0;
  const status = statusMeta[order.status];
  const previewText = hasMoreItems
    ? `${itemsPreview}, ${t('commercial.orders.summary.moreItems', { count: additionalCount })}`
    : itemsPreview;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleBlock}>
          <ThemedText style={styles.orderNumber}>{order.orderNumber}</ThemedText>
          <ThemedText style={styles.orderDate}>{formattedDate}</ThemedText>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: status.background }]}
          accessible={false}
        >
          <ThemedText style={[styles.statusBadgeText, { color: status.color }]}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      <View style={styles.storeRow}>
        {order.storeLogoUrl ? (
          <Image source={{ uri: order.storeLogoUrl }} style={styles.storeLogo} resizeMode="cover" />
        ) : (
          <View style={styles.storeLogoFallback}>
            <Ionicons name="storefront" size={18} color={colors.icon} />
          </View>
        )}
        <View style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{order.storeName}</ThemedText>
          <ThemedText style={styles.storeMeta}>
            {t('commercial.orders.summary.items', { count: order.itemCount })}
          </ThemedText>
        </View>
        <ThemedText style={styles.orderAmount}>{formattedAmount}</ThemedText>
      </View>

      <View style={styles.orderMetaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="bag" size={14} color={colors.iconMuted} />
          <ThemedText style={styles.metaText}>
            {t('commercial.orders.summary.itemCount', { count: order.itemCount })}
          </ThemedText>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Ionicons name="layers" size={14} color={colors.iconMuted} />
          <ThemedText style={styles.metaText}>
            {t('commercial.orders.summary.quantity', { count: order.totalQuantity })}
          </ThemedText>
        </View>
      </View>

      {itemsPreview ? (
        <View style={styles.itemsPreviewRow}>
          <Ionicons name="receipt" size={14} color={colors.iconMuted} />
          <ThemedText style={styles.itemsPreviewText} numberOfLines={2}>
            {previewText}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 32,
    },
    headerSection: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
      gap: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    filtersBlock: {
      gap: 16,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 0,
      color: colors.text,
      fontSize: 14,
    },
    clearButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
    },
    filterGroup: {
      gap: 8,
    },
    filterLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    filterChipRow: {
      gap: 8,
      paddingRight: 8,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentStrong,
    },
    filterChipText: {
      fontSize: 13,
      color: colors.text,
    },
    filterChipTextActive: {
      fontSize: 13,
      color: colors.accentStrong,
      fontWeight: '600',
    },
    orderCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    orderTitleBlock: {
      flex: 1,
      gap: 4,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    orderDate: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    storeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    storeLogo: {
      width: 44,
      height: 44,
      borderRadius: 12,
    },
    storeLogoFallback: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
    },
    storeInfo: {
      flex: 1,
      gap: 2,
    },
    storeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    storeMeta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    orderAmount: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    orderMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      fontSize: 12,
      color: colors.text,
    },
    metaDivider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border,
    },
    itemsPreviewRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    itemsPreviewText: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 48,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });

export default OrderManagementScreen;
