/**
 * Booking module types
 * Defines types for store booking system with service-specific calendars
 */

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'in_progress'
  | 'completed';

export type CancelledBy = 'user' | 'store';

/**
 * Service offered by a store with dedicated booking calendar
 */
export interface Service {
  id: string;
  storeId: string;
  name: string;
  description: string;
  durationMinutes?: number; // Optional default duration
  bufferBeforeMinutes?: number; // Buffer time before booking
  bufferAfterMinutes?: number; // Buffer time after booking
  capacity?: number; // Number of concurrent bookings allowed (default 1)
  price?: string; // Optional price display
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking request and record
 */
export interface Booking {
  id: string;
  storeId: string;
  serviceId: string;
  userId: string; // The user who made the booking
  
  // User info snapshot
  userName: string;
  userContact: string; // Phone or email
  
  // Service info snapshot
  serviceName: string;
  serviceDescription: string;
  
  // Time range
  startAt: Date;
  endAt: Date;
  
  // User request/notes
  note?: string;
  
  // Status tracking
  status: BookingStatus;
  statusReason?: string; // Rejection or cancellation reason
  cancelledBy?: CancelledBy;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}

/**
 * Calendar slot for availability view
 */
export interface CalendarSlot {
  start: Date;
  end: Date;
  busy: boolean;
  booking?: {
    id: string;
    userId: string; // To check if current user owns it
    serviceName: string;
    // Other details only shown if user owns the booking
  };
}

/**
 * Calendar availability request
 */
export interface CalendarAvailabilityRequest {
  storeId: string;
  serviceId: string;
  from: Date;
  to: Date; // Max 1 month from 'from'
}

/**
 * Calendar availability response
 */
export interface CalendarAvailability {
  storeId: string;
  serviceId: string;
  range: {
    from: Date;
    to: Date;
  };
  slots: CalendarSlot[];
}

/**
 * Create booking request
 */
export interface CreateBookingRequest {
  storeId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  userName: string;
  userContact: string;
  serviceDescription?: string;
  note?: string;
}

/**
 * Update booking request
 */
export interface UpdateBookingRequest {
  startAt?: Date;
  endAt?: Date;
  note?: string;
}

/**
 * Cancel booking request
 */
export interface CancelBookingRequest {
  reason?: string;
}

/**
 * Store with booking capability
 */
export interface BookingEnabledStore {
  id: string;
  name: string;
  bookingEnabled: boolean;
  timezone?: string;
  services: Service[];
}

/**
 * Booking filter for user's booking list
 */
export interface BookingFilter {
  status?: BookingStatus[];
  storeId?: string;
  from?: Date;
  to?: Date;
}

/**
 * Store action: confirm booking
 */
export interface ConfirmBookingRequest {
  note?: string; // Optional confirmation message
}

/**
 * Store action: reject booking
 */
export interface RejectBookingRequest {
  reason: string; // Required rejection reason
}
