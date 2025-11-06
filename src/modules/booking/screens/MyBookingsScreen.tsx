/**
 * My Bookings Screen
 * Shows all user's bookings across stores
 */
import { useAuthStore, useBookingStore } from '@/core/store';
import { BookingCard } from '@/modules/booking/components/BookingCard';
import { useBookingData } from '@/modules/booking/hooks/useBookingData';
import { BookingFilter, BookingStatus } from '@/modules/booking/types';
import { useAppTheme } from '@/shared/hooks';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const UPCOMING_STATUSES: BookingStatus[] = ['confirmed', 'requested', 'in_progress'];

type FilterValue = 'all' | 'upcoming' | BookingStatus;

const STATUS_FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'requested' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function MyBookingsScreen() {
  const { user } = useAuthStore();
  const bookings = useBookingStore((state) => state.bookings);
  const getUserBookings = useBookingStore((state) => state.getUserBookings);
  const isLoading = useBookingStore((state) => state.isLoading);
  const setLoading = useBookingStore((state) => state.setLoading);
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Load booking data
  useBookingData();

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    // In real app, fetch from API
    // For now, data is already in store from mock
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filterCriteria = useMemo<BookingFilter | undefined>(() => {
    if (selectedFilter === 'all') {
      return undefined;
    }

    if (selectedFilter === 'upcoming') {
      return { status: UPCOMING_STATUSES };
    }

    return { status: [selectedFilter] };
  }, [selectedFilter]);

  const userId = user?.id;

  const visibleBookings = useMemo(() => {
    if (!userId || bookings.length === 0) {
      return [];
    }

    const baseBookings = getUserBookings(userId, filterCriteria);

    if (selectedFilter !== 'upcoming') {
      return baseBookings;
    }

    const now = Date.now();

    return baseBookings.filter((booking) => {
      if (booking.status === 'in_progress') {
        return true;
      }

      return booking.startAt.getTime() >= now;
    });
  }, [bookings, filterCriteria, getUserBookings, selectedFilter, userId]);

  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking-detail?id=${bookingId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : visibleBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>
            Find stores with booking enabled to make your first reservation
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={() => handleBookingPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 60,
    paddingVertical: 6,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  filterContainer: {
    maxHeight: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
