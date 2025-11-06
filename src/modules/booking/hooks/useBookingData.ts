/**
 * Hook to load booking data
 */
import { useBookingStore } from '@/core/store';
import { mockBookings } from '../data/mockBookings';
import { mockServices } from '../data/mockServices';
import { useEffect } from 'react';

export function useBookingData() {
  const { setBookings, setServices, bookings, services } = useBookingStore();

  useEffect(() => {
    // Load mock data on mount if not already loaded
    if (bookings.length === 0) {
      setBookings(mockBookings);
    }
    if (services.length === 0) {
      setServices(mockServices);
    }
  }, []);

  return {
    bookings,
    services,
  };
}
