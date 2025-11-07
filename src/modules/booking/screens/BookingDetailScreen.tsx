/**
 * Booking Detail Screen
 * Shows full details of a booking with minimal, clean design
 */
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { useAuthStore, useBookingStore } from '@/core/store';
import { useBookingData } from '@/modules/booking/hooks/useBookingData';
import { cancelBooking } from '@/modules/booking/services/bookingService';
import { Booking } from '@/modules/booking/types';
import { useAppTheme } from '@/shared/hooks';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getBookingById, updateBooking: updateStoreBooking } = useBookingStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load booking data
  useBookingData();

  useEffect(() => {
    if (id) {
      loadBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBooking = () => {
    const foundBooking = getBookingById(id);
    if (foundBooking && foundBooking.userId === user?.id) {
      setBooking(foundBooking);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (!booking || !user) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const updated = await cancelBooking(booking.id, {}, user.id);
              updateStoreBooking(booking.id, updated);
              setBooking(updated);
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to cancel booking');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const canCancel = booking && 
    booking.status !== 'cancelled' && 
    booking.status !== 'completed' && 
    booking.status !== 'rejected';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(booking.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{booking.serviceName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow label="Service" value={booking.serviceDescription} />
          <DetailRow
            label="Date"
            value={booking.startAt.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          <DetailRow
            label="Time"
            value={`${booking.startAt.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })} - ${booking.endAt.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <DetailRow label="Name" value={booking.userName} />
          <DetailRow label="Contact" value={booking.userContact} />
        </View>

        {booking.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Note</Text>
            <Text style={styles.noteText}>{booking.note}</Text>
          </View>
        )}

        {booking.statusReason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {booking.status === 'rejected' ? 'Rejection Reason' : 'Note from Store'}
            </Text>
            <Text style={styles.noteText}>{booking.statusReason}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <TimelineItem label="Created" date={booking.createdAt} colors={colors} />
          {booking.confirmedAt && (
            <TimelineItem label="Confirmed" date={booking.confirmedAt} colors={colors} />
          )}
          {booking.completedAt && (
            <TimelineItem label="Completed" date={booking.completedAt} colors={colors} />
          )}
        </View>

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, actionLoading && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={actionLoading}
            activeOpacity={0.7}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const TimelineItem: React.FC<{ label: string; date: Date; colors: any }> = ({ label, date, colors }) => {
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineDate}>
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
      </View>
    </View>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return '#4CAF50';
    case 'requested':
      return '#FF9800';
    case 'rejected':
      return '#F44336';
    case 'cancelled':
      return '#9E9E9E';
    case 'in_progress':
      return '#2196F3';
    case 'completed':
      return '#607D8B';
    default:
      return '#9E9E9E';
  }
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorText: {
    fontSize: Typography.size.lg,
    lineHeight: Typography.lineHeight.lg,
    fontWeight: Typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size.xxl,
    lineHeight: Typography.lineHeight.xxl,
    fontWeight: Typography.weight.bold,
    color: colors.text,
    flex: 1,
    marginRight: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.pill,
  },
  statusText: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  detailLabel: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.medium,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  noteText: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.text,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: Radii.pill,
    backgroundColor: colors.accent,
    marginTop: Spacing.xs,
    marginRight: Spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.medium,
    color: colors.text,
    marginBottom: Spacing.xs / 2,
  },
  timelineDate: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
  },
  buttonText: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: colors.danger,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
