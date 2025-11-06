/**
 * Booking store slice
 * Manages booking state with Zustand
 */
import { Booking, BookingFilter, Service } from '@/modules/booking/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookingState {
  bookings: Booking[];
  services: Service[];
  selectedStoreId: string | null;
  selectedServiceId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface BookingActions {
  // Bookings
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  removeBooking: (bookingId: string) => void;
  getBookingById: (bookingId: string) => Booking | undefined;
  getUserBookings: (userId: string, filter?: BookingFilter) => Booking[];
  
  // Services
  setServices: (services: Service[]) => void;
  getServicesByStoreId: (storeId: string) => Service[];
  getServiceById: (serviceId: string) => Service | undefined;
  
  // Selection
  setSelectedStore: (storeId: string | null) => void;
  setSelectedService: (serviceId: string | null) => void;
  
  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  bookings: [],
  services: [],
  selectedStoreId: null,
  selectedServiceId: null,
  isLoading: false,
  error: null,
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Bookings
      setBookings: (bookings) => set({ bookings }),
      
      addBooking: (booking) =>
        set((state) => ({
          bookings: [...state.bookings, booking],
        })),
      
      updateBooking: (bookingId, updates) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, ...updates, updatedAt: new Date() } : b
          ),
        })),
      
      removeBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
        })),
      
      getBookingById: (bookingId) => {
        const state = get();
        return state.bookings.find((b) => b.id === bookingId);
      },
      
      getUserBookings: (userId, filter) => {
        const state = get();
        let userBookings = state.bookings.filter((b) => b.userId === userId);
        
        if (filter) {
          if (filter.status && filter.status.length > 0) {
            userBookings = userBookings.filter((b) =>
              filter.status!.includes(b.status)
            );
          }
          
          if (filter.storeId) {
            userBookings = userBookings.filter(
              (b) => b.storeId === filter.storeId
            );
          }
          
          if (filter.from) {
            userBookings = userBookings.filter((b) => b.startAt >= filter.from!);
          }
          
          if (filter.to) {
            userBookings = userBookings.filter((b) => b.startAt <= filter.to!);
          }
        }
        
        // Sort by start date descending (most recent first)
        return userBookings.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
      },

      // Services
      setServices: (services) => set({ services }),
      
      getServicesByStoreId: (storeId) => {
        const state = get();
        return state.services.filter((s) => s.storeId === storeId && s.isActive);
      },
      
      getServiceById: (serviceId) => {
        const state = get();
        return state.services.find((s) => s.id === serviceId);
      },

      // Selection
      setSelectedStore: (storeId) => set({ selectedStoreId: storeId }),
      
      setSelectedService: (serviceId) => set({ selectedServiceId: serviceId }),

      // Loading & Error
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookings: state.bookings,
        services: state.services,
      }),
    }
  )
);
