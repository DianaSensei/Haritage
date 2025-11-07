/**
 * Booking Calendar Component
 * Shows availability for a service in a clean, minimal calendar view
 */
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { CalendarSlot } from '@/modules/booking/types';
import { useAppTheme } from '@/shared/hooks';
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
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
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
                    activeOpacity={0.7}
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
                        {isUserBooking ? 'Yours' : 'Busy'}
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: Spacing.xl,
  },
  dayHeader: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
    color: colors.text,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minWidth: 90,
  },
  busySlot: {
    backgroundColor: colors.surfaceTertiary,
    borderColor: colors.borderMuted,
  },
  userBookingSlot: {
    backgroundColor: colors.accentSofter,
    borderColor: colors.accent,
  },
  selectedSlot: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  disabledSlot: {
    opacity: 0.4,
  },
  slotTime: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.medium,
    color: colors.text,
  },
  slotTimeBusy: {
    color: '#FFFFFF',
  },
  slotStatus: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    color: colors.textMuted,
    marginTop: Spacing.xs / 2,
  },
  slotStatusUser: {
    color: colors.accent,
  },
});
