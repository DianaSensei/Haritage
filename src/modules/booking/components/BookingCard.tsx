/**
 * Booking Card Component
 * Displays a booking summary in list views
 */
import { Booking, BookingStatus } from '@/modules/booking/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Text style={styles.storeName}>{booking.serviceDescription}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateTime}>
          {booking.startAt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.dateTime}>
          {booking.startAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}{' '}
          -{' '}
          {booking.endAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
      </View>

      {booking.note && (
        <Text style={styles.note} numberOfLines={2}>
          {booking.note}
        </Text>
      )}

      {booking.statusReason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>
            {booking.status === 'rejected' ? 'Rejection reason:' : 'Note:'}
          </Text>
          <Text style={styles.reasonText}>{booking.statusReason}</Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  reasonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reasonLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
  },
});
