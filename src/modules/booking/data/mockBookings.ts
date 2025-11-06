/**
 * Mock bookings data
 */
import { Booking } from '../types';

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    storeId: 'store-luna-living',
    serviceId: 'service-luna-consultation',
    userId: 'user-123',
    userName: 'John Doe',
    userContact: '+1-555-0101',
    serviceName: 'Interior Design Consultation',
    serviceDescription: 'One-on-one consultation with our interior design expert',
    startAt: new Date('2025-11-10T14:00:00Z'),
    endAt: new Date('2025-11-10T15:00:00Z'),
    note: 'Looking for advice on living room makeover',
    status: 'confirmed',
    createdAt: new Date('2025-11-05T10:00:00Z'),
    updatedAt: new Date('2025-11-05T12:00:00Z'),
    confirmedAt: new Date('2025-11-05T12:00:00Z'),
  },
  {
    id: 'booking-002',
    storeId: 'store-luna-living',
    serviceId: 'service-luna-workshop',
    userId: 'user-123',
    userName: 'John Doe',
    userContact: '+1-555-0101',
    serviceName: 'DIY Home Decor Workshop',
    serviceDescription: 'Group workshop for creating minimalist home decor',
    startAt: new Date('2025-11-15T10:00:00Z'),
    endAt: new Date('2025-11-15T12:00:00Z'),
    note: 'Bringing a friend',
    status: 'requested',
    createdAt: new Date('2025-11-06T09:00:00Z'),
    updatedAt: new Date('2025-11-06T09:00:00Z'),
  },
  {
    id: 'booking-003',
    storeId: 'store-luna-living',
    serviceId: 'service-luna-consultation',
    userId: 'user-456',
    userName: 'Jane Smith',
    userContact: 'jane@example.com',
    serviceName: 'Interior Design Consultation',
    serviceDescription: 'One-on-one consultation with our interior design expert',
    startAt: new Date('2025-11-08T15:00:00Z'),
    endAt: new Date('2025-11-08T16:00:00Z'),
    status: 'confirmed',
    createdAt: new Date('2025-11-03T14:00:00Z'),
    updatedAt: new Date('2025-11-03T16:00:00Z'),
    confirmedAt: new Date('2025-11-03T16:00:00Z'),
  },
  {
    id: 'booking-004',
    storeId: 'store-luna-living',
    serviceId: 'service-luna-custom-order',
    userId: 'user-123',
    userName: 'John Doe',
    userContact: '+1-555-0101',
    serviceName: 'Custom Furniture Design',
    serviceDescription: 'Discuss custom furniture pieces for your space',
    startAt: new Date('2025-10-15T13:00:00Z'),
    endAt: new Date('2025-10-15T14:30:00Z'),
    status: 'completed',
    createdAt: new Date('2025-10-01T10:00:00Z'),
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    confirmedAt: new Date('2025-10-01T11:00:00Z'),
    completedAt: new Date('2025-10-15T14:30:00Z'),
  },
  {
    id: 'booking-005',
    storeId: 'store-luna-living',
    serviceId: 'service-luna-consultation',
    userId: 'user-123',
    userName: 'John Doe',
    userContact: '+1-555-0101',
    serviceName: 'Interior Design Consultation',
    serviceDescription: 'One-on-one consultation with our interior design expert',
    startAt: new Date('2025-10-20T10:00:00Z'),
    endAt: new Date('2025-10-20T11:00:00Z'),
    note: 'Need to reschedule',
    status: 'cancelled',
    statusReason: 'Schedule conflict',
    cancelledBy: 'user',
    createdAt: new Date('2025-10-10T09:00:00Z'),
    updatedAt: new Date('2025-10-18T14:00:00Z'),
  },
];

/**
 * Get all bookings for a user
 */
export function getBookingsByUserId(userId: string): Booking[] {
  return mockBookings.filter((booking) => booking.userId === userId);
}

/**
 * Get a specific booking by ID
 */
export function getBookingById(bookingId: string): Booking | undefined {
  return mockBookings.find((booking) => booking.id === bookingId);
}

/**
 * Get bookings for a store and service within a date range
 */
export function getBookingsByServiceAndDateRange(
  serviceId: string,
  from: Date,
  to: Date
): Booking[] {
  return mockBookings.filter(
    (booking) =>
      booking.serviceId === serviceId &&
      booking.status !== 'rejected' &&
      booking.status !== 'cancelled' &&
      booking.startAt >= from &&
      booking.startAt <= to
  );
}
