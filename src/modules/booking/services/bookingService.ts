/**
 * Booking service
 * Handles booking operations and business logic
 */
import { CONFIG } from '@/core/config';
import { useAuthStore } from '@/core/store';
import {
  Booking,
  BookingStatus,
  CalendarAvailability,
  CalendarSlot,
  CancelBookingRequest,
  ConfirmBookingRequest,
  CreateBookingRequest,
  RejectBookingRequest,
  Service,
  UpdateBookingRequest,
} from '../types';
import { getBookingsByServiceAndDateRange, mockBookings } from '../data/mockBookings';
import { getServiceById, getServicesByStoreId, isBookingEnabledForStore } from '../data/mockServices';

/**
 * Create a new booking
 */
export async function createBooking(
  request: CreateBookingRequest,
  userId: string
): Promise<Booking> {
  // Validate store has booking enabled
  if (!isBookingEnabledForStore(request.storeId)) {
    throw new Error('Booking is not enabled for this store');
  }

  // Validate service exists and belongs to store
  const service = getServiceById(request.serviceId);
  if (!service || service.storeId !== request.storeId) {
    throw new Error('Invalid service for this store');
  }

  // Validate time range
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + CONFIG.BOOKING.MAX_ADVANCE_DAYS);

  if (request.startAt < now) {
    throw new Error('Cannot book in the past');
  }

  if (request.startAt > maxDate) {
    throw new Error(`Cannot book more than ${CONFIG.BOOKING.MAX_ADVANCE_DAYS} days in advance`);
  }

  if (request.endAt <= request.startAt) {
    throw new Error('End time must be after start time');
  }

  const durationMinutes = (request.endAt.getTime() - request.startAt.getTime()) / (1000 * 60);
  if (durationMinutes < CONFIG.BOOKING.MIN_BOOKING_MINUTES) {
    throw new Error(`Booking must be at least ${CONFIG.BOOKING.MIN_BOOKING_MINUTES} minutes`);
  }

  // Check for conflicts
  const conflicts = await checkBookingConflicts(
    request.serviceId,
    request.startAt,
    request.endAt,
    service
  );

  if (conflicts.length > 0) {
    throw new Error('Time slot is not available');
  }

  // Create booking
  const booking: Booking = {
    id: `booking-${Date.now()}`,
    storeId: request.storeId,
    serviceId: request.serviceId,
    userId,
    userName: request.userName,
    userContact: request.userContact,
    serviceName: service.name,
    serviceDescription: request.serviceDescription || service.description,
    startAt: request.startAt,
    endAt: request.endAt,
    note: request.note,
    status: 'requested',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // In real app, save to backend
  mockBookings.push(booking);

  return booking;
}

/**
 * Update an existing booking
 */
export async function updateBooking(
  bookingId: string,
  request: UpdateBookingRequest,
  userId: string
): Promise<Booking> {
  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new Error('You can only update your own bookings');
  }

  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    throw new Error('Cannot update cancelled or rejected bookings');
  }

  if (booking.status === 'completed') {
    throw new Error('Cannot update completed bookings');
  }

  // If updating time, validate and check conflicts
  if (request.startAt || request.endAt) {
    const newStart = request.startAt || booking.startAt;
    const newEnd = request.endAt || booking.endAt;

    if (newEnd <= newStart) {
      throw new Error('End time must be after start time');
    }

    const service = getServiceById(booking.serviceId);
    if (service) {
      const conflicts = await checkBookingConflicts(
        booking.serviceId,
        newStart,
        newEnd,
        service,
        bookingId
      );

      if (conflicts.length > 0) {
        throw new Error('Time slot is not available');
      }
    }
  }

  // Update booking
  Object.assign(booking, {
    ...request,
    updatedAt: new Date(),
    // If time is changed, set status back to requested
    status:
      request.startAt || request.endAt ? 'requested' : booking.status,
  });

  return booking;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  bookingId: string,
  request: CancelBookingRequest,
  userId: string
): Promise<Booking> {
  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new Error('You can only cancel your own bookings');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    throw new Error('Cannot cancel completed bookings');
  }

  // Cancel booking
  booking.status = 'cancelled';
  booking.statusReason = request.reason;
  booking.cancelledBy = 'user';
  booking.updatedAt = new Date();

  return booking;
}

/**
 * Confirm a booking (store action)
 */
export async function confirmBooking(
  bookingId: string,
  request: ConfirmBookingRequest
): Promise<Booking> {
  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'requested') {
    throw new Error('Can only confirm requested bookings');
  }

  // Final conflict check
  const service = getServiceById(booking.serviceId);
  if (service) {
    const conflicts = await checkBookingConflicts(
      booking.serviceId,
      booking.startAt,
      booking.endAt,
      service,
      bookingId
    );

    if (conflicts.length > 0) {
      throw new Error('Time slot is no longer available');
    }
  }

  booking.status = 'confirmed';
  booking.confirmedAt = new Date();
  booking.updatedAt = new Date();
  if (request.note) {
    booking.statusReason = request.note;
  }

  return booking;
}

/**
 * Reject a booking (store action)
 */
export async function rejectBooking(
  bookingId: string,
  request: RejectBookingRequest
): Promise<Booking> {
  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'requested') {
    throw new Error('Can only reject requested bookings');
  }

  booking.status = 'rejected';
  booking.statusReason = request.reason;
  booking.updatedAt = new Date();

  return booking;
}

/**
 * Get calendar availability for a service
 */
export async function getCalendarAvailability(
  storeId: string,
  serviceId: string,
  from: Date,
  to: Date,
  currentUserId?: string
): Promise<CalendarAvailability> {
  // Validate store has booking enabled
  if (!isBookingEnabledForStore(storeId)) {
    throw new Error('Booking is not enabled for this store');
  }

  // Validate service
  const service = getServiceById(serviceId);
  if (!service || service.storeId !== storeId) {
    throw new Error('Invalid service for this store');
  }

  // Limit date range to max advance days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + CONFIG.BOOKING.MAX_ADVANCE_DAYS);
  if (to > maxDate) {
    to = maxDate;
  }

  // Get existing bookings in range
  const existingBookings = getBookingsByServiceAndDateRange(serviceId, from, to);

  // Generate calendar slots
  const slots: CalendarSlot[] = [];
  const slotInterval = CONFIG.BOOKING.SLOT_INTERVAL_MINUTES * 60 * 1000; // Convert to ms

  let currentSlot = new Date(from);
  while (currentSlot < to) {
    const slotEnd = new Date(currentSlot.getTime() + slotInterval);

    // Check if slot overlaps with any booking
    const overlappingBooking = existingBookings.find((booking) => {
      return (
        (currentSlot >= booking.startAt && currentSlot < booking.endAt) ||
        (slotEnd > booking.startAt && slotEnd <= booking.endAt) ||
        (currentSlot <= booking.startAt && slotEnd >= booking.endAt)
      );
    });

    const slot: CalendarSlot = {
      start: new Date(currentSlot),
      end: new Date(slotEnd),
      busy: !!overlappingBooking,
    };

    // Only include booking info if user owns it
    if (overlappingBooking && overlappingBooking.userId === currentUserId) {
      slot.booking = {
        id: overlappingBooking.id,
        userId: overlappingBooking.userId,
        serviceName: overlappingBooking.serviceName,
      };
    } else if (overlappingBooking) {
      // Show it's busy but don't reveal details
      slot.booking = {
        id: '', // Don't reveal ID
        userId: overlappingBooking.userId,
        serviceName: service.name, // Only show service name, not booking-specific info
      };
    }

    slots.push(slot);
    currentSlot = slotEnd;
  }

  return {
    storeId,
    serviceId,
    range: { from, to },
    slots,
  };
}

/**
 * Check for booking conflicts
 */
async function checkBookingConflicts(
  serviceId: string,
  startAt: Date,
  endAt: Date,
  service: Service,
  excludeBookingId?: string
): Promise<Booking[]> {
  // Get existing bookings for the service
  const existingBookings = mockBookings.filter(
    (b) =>
      b.serviceId === serviceId &&
      b.status !== 'rejected' &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId
  );

  // Apply buffer times
  const bufferBefore = (service.bufferBeforeMinutes || CONFIG.BOOKING.DEFAULT_BUFFER_MINUTES) * 60 * 1000;
  const bufferAfter = (service.bufferAfterMinutes || CONFIG.BOOKING.DEFAULT_BUFFER_MINUTES) * 60 * 1000;

  const effectiveStart = new Date(startAt.getTime() - bufferBefore);
  const effectiveEnd = new Date(endAt.getTime() + bufferAfter);

  // Find conflicts
  const conflicts = existingBookings.filter((booking) => {
    const bookingEffectiveStart = new Date(
      booking.startAt.getTime() - bufferBefore
    );
    const bookingEffectiveEnd = new Date(
      booking.endAt.getTime() + bufferAfter
    );

    // Check for overlap
    return (
      (effectiveStart >= bookingEffectiveStart &&
        effectiveStart < bookingEffectiveEnd) ||
      (effectiveEnd > bookingEffectiveStart &&
        effectiveEnd <= bookingEffectiveEnd) ||
      (effectiveStart <= bookingEffectiveStart &&
        effectiveEnd >= bookingEffectiveEnd)
    );
  });

  // Check capacity
  const capacity = service.capacity || 1;
  if (conflicts.length >= capacity) {
    return conflicts;
  }

  return [];
}

/**
 * Get all services for a store
 */
export async function getStoreServices(storeId: string): Promise<Service[]> {
  if (!isBookingEnabledForStore(storeId)) {
    throw new Error('Booking is not enabled for this store');
  }

  return getServicesByStoreId(storeId);
}

/**
 * Get user's bookings with optional filter
 */
export async function getUserBookings(
  userId: string,
  filter?: {
    status?: BookingStatus[];
    storeId?: string;
    from?: Date;
    to?: Date;
  }
): Promise<Booking[]> {
  let userBookings = mockBookings.filter((b) => b.userId === userId);

  if (filter) {
    if (filter.status && filter.status.length > 0) {
      userBookings = userBookings.filter((b) => filter.status!.includes(b.status));
    }

    if (filter.storeId) {
      userBookings = userBookings.filter((b) => b.storeId === filter.storeId);
    }

    if (filter.from) {
      userBookings = userBookings.filter((b) => b.startAt >= filter.from!);
    }

    if (filter.to) {
      userBookings = userBookings.filter((b) => b.startAt <= filter.to!);
    }
  }

  return userBookings.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
}

/**
 * Get booking by ID (with permission check)
 */
export async function getBookingDetail(
  bookingId: string,
  userId: string
): Promise<Booking> {
  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Only booking owner can see details
  if (booking.userId !== userId) {
    throw new Error('You can only view your own booking details');
  }

  return booking;
}
