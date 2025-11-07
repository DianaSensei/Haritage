/**
 * Booking Card Component
 * Displays a booking summary in list views with minimal, clean design
 */
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { Booking, BookingStatus } from '@/modules/booking/types';
import { useAppTheme } from '@/shared/hooks';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);

  // Format date and time more compactly
  const dateText = booking.startAt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  const timeText = `${booking.startAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} - ${booking.endAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {booking.serviceName}
          </Text>
          <Text style={styles.serviceDescription} numberOfLines={1}>
            {booking.serviceDescription}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.dateTime}>{dateText}</Text>
        <Text style={styles.timeSeparator}>•</Text>
        <Text style={styles.dateTime}>{timeText}</Text>
      </View>

      {booking.note && (
        <Text style={styles.note} numberOfLines={2}>
          {booking.note}
        </Text>
      )}

      {booking.statusReason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonText} numberOfLines={2}>
            {booking.statusReason}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

function getStatusColor(status: BookingStatus): string {
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

function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'requested':
      return 'Pending';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  serviceName: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: colors.text,
    marginBottom: Spacing.xs / 2,
  },
  serviceDescription: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
    letterSpacing: Typography.letterSpacing.wide,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dateTime: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.text,
  },
  timeSeparator: {
    fontSize: Typography.size.sm,
    color: colors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  note: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  reasonContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
  reasonText: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.textMuted,
  },
});
