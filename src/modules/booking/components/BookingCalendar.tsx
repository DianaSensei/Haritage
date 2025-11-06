/**
 * Booking Calendar Component
 * Shows availability for a service in a monthly calendar view
 */
import { CONFIG } from '@/core/config';
import { CalendarSlot } from '@/modules/booking/types';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingCalendarProps {
  slots: CalendarSlot[];
  selectedSlot?: CalendarSlot;
  onSlotSelect?: (slot: CalendarSlot) => void;
  currentUserId?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  currentUserId,
}) => {
  // Group slots by day
  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarSlot[]>();
    
    slots.forEach((slot) => {
      const dayKey = slot.start.toISOString().split('T')[0];
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(slot);
    });
    
    return grouped;
  }, [slots]);

  const days = Array.from(slotsByDay.keys()).sort();

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const daySlots = slotsByDay.get(day) || [];
        const dayDate = new Date(day);
        
        return (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayHeader}>
              {dayDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            
            <View style={styles.slotsContainer}>
              {daySlots.map((slot, index) => {
                const isSelected = selectedSlot?.start.getTime() === slot.start.getTime();
                const isUserBooking = slot.booking?.userId === currentUserId;
                const canSelect = !slot.busy || isUserBooking;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slot,
                      slot.busy && styles.busySlot,
                      isUserBooking && styles.userBookingSlot,
                      isSelected && styles.selectedSlot,
                      !canSelect && styles.disabledSlot,
                    ]}
                    onPress={() => canSelect && onSlotSelect?.(slot)}
                    disabled={!canSelect}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        (slot.busy || isSelected) && styles.slotTimeBusy,
                      ]}
                    >
                      {slot.start.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                    
                    {slot.busy && (
                      <Text
                        style={[
                          styles.slotStatus,
                          isUserBooking && styles.slotStatusUser,
                        ]}
                      >
                        {isUserBooking ? 'Your booking' : 'Busy'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    minWidth: 100,
  },
  busySlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D0D0D0',
  },
  userBookingSlot: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  selectedSlot: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  disabledSlot: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  slotTimeBusy: {
    color: '#FFF',
  },
  slotStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  slotStatusUser: {
    color: '#1976D2',
  },
});
