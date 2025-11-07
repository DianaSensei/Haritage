/**
 * Store Booking Calendar Screen
 * View service calendar and create bookings with minimal, clean design
 */
import { CONFIG } from '@/core/config';
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { useAuthStore, useBookingStore } from '@/core/store';
import { BookingCalendar } from '@/modules/booking/components/BookingCalendar';
import { useBookingData } from '@/modules/booking/hooks/useBookingData';
import {
  createBooking,
  getCalendarAvailability,
  getStoreServices,
} from '@/modules/booking/services/bookingService';
import { CalendarSlot, Service } from '@/modules/booking/types';
import { useAppTheme } from '@/shared/hooks';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StoreBookingCalendarScreen() {
  const { storeId, storeName } = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const { user } = useAuthStore();
  const { addBooking } = useBookingStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Load booking data
  useBookingData();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // Booking form state
  const [userName, setUserName] = useState(user?.name || '');
  const [userContact, setUserContact] = useState(user?.phoneNumber || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => {
    if (selectedService) {
      loadCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const storeServices = await getStoreServices(storeId);
      setServices(storeServices);
      if (storeServices.length > 0) {
        setSelectedService(storeServices[0]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    if (!selectedService || !user) return;

    try {
      setLoading(true);
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + CONFIG.BOOKING.MAX_ADVANCE_DAYS);

      const availability = await getCalendarAvailability(
        storeId,
        selectedService.id,
        from,
        to,
        user.id
      );

      setSlots(availability.slots);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: CalendarSlot) => {
    if (!slot.busy || slot.booking?.userId === user?.id) {
      setSelectedSlot(slot);
      if (!slot.busy) {
        setBookingModalVisible(true);
      } else {
        // Navigate to booking detail if it's user's booking
        if (slot.booking?.id) {
          router.push(`/booking-detail?id=${slot.booking.id}`);
        }
      }
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedSlot || !user) return;

    if (!userName.trim() || !userContact.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Calculate end time based on service duration or slot
      const endAt = selectedService.durationMinutes
        ? new Date(selectedSlot.start.getTime() + selectedService.durationMinutes * 60 * 1000)
        : selectedSlot.end;

      const booking = await createBooking(
        {
          storeId,
          serviceId: selectedService.id,
          startAt: selectedSlot.start,
          endAt,
          userName: userName.trim(),
          userContact: userContact.trim(),
          serviceDescription: selectedService.description,
          note: note.trim() || undefined,
        },
        user.id
      );

      addBooking(booking);
      setBookingModalVisible(false);
      Alert.alert(
        'Success',
        'Booking request submitted! The store will confirm your booking soon.',
        [
          {
            text: 'View Booking',
            onPress: () => router.push(`/booking-detail?id=${booking.id}`),
          },
          { text: 'OK' },
        ]
      );

      // Reload calendar
      loadCalendar();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{storeName || 'Store'}</Text>
      </View>

      {/* Service selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.serviceSelector}
        contentContainerStyle={styles.serviceSelectorContent}
      >
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceButton,
              selectedService?.id === service.id && styles.serviceButtonActive,
            ]}
            onPress={() => setSelectedService(service)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.serviceButtonText,
                selectedService?.id === service.id && styles.serviceButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {service.name}
            </Text>
            {service.price && (
              <Text
                style={[
                  styles.servicePrice,
                  selectedService?.id === service.id && styles.servicePriceActive,
                ]}
              >
                {service.price}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Service info */}
      {selectedService && (
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {selectedService.description}
          </Text>
          {selectedService.durationMinutes && (
            <Text style={styles.serviceDuration}>
              {selectedService.durationMinutes} min
            </Text>
          )}
        </View>
      )}

      {/* Calendar */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.calendarContainer}>
          <BookingCalendar
            slots={slots}
            selectedSlot={selectedSlot || undefined}
            onSlotSelect={handleSlotSelect}
            currentUserId={user?.id}
          />
        </ScrollView>
      )}

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>

            {selectedSlot && (
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Date & Time</Text>
                <Text style={styles.modalValue}>
                  {selectedSlot.start.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.modalValue}>
                  {selectedSlot.start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            )}

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Your Name *</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Contact *</Text>
              <TextInput
                style={styles.input}
                value={userContact}
                onChangeText={setUserContact}
                placeholder="Phone or email"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Special requests or notes"
                placeholderTextColor={colors.textSubtle}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBookingModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, submitting && styles.buttonDisabled]}
                onPress={handleCreateBooking}
                disabled={submitting}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: Typography.size.xxl,
    lineHeight: Typography.lineHeight.xxl,
    fontWeight: Typography.weight.bold,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSelector: {
    maxHeight: 110,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceSelectorContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  serviceButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minWidth: 140,
  },
  serviceButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  serviceButtonText: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.text,
    marginBottom: Spacing.xs / 2,
  },
  serviceButtonTextActive: {
    color: '#FFFFFF',
  },
  servicePrice: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    color: colors.textMuted,
  },
  servicePriceActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  serviceInfo: {
    padding: Spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceDescription: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: colors.textMuted,
    marginBottom: Spacing.xs,
  },
  serviceDuration: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    color: colors.textSubtle,
  },
  calendarContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.xxl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Typography.size.xxl,
    lineHeight: Typography.lineHeight.xxl,
    fontWeight: Typography.weight.bold,
    color: colors.text,
    marginBottom: Spacing.xl,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.text,
    marginBottom: Spacing.sm,
  },
  modalValue: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    color: colors.textMuted,
    marginBottom: Spacing.xs / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.sm + 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceTertiary,
  },
  cancelButtonText: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: colors.textMuted,
  },
  confirmButton: {
    backgroundColor: colors.accent,
  },
  confirmButtonText: {
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
