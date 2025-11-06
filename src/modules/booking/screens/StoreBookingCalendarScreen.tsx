/**
 * Store Booking Calendar Screen
 * View service calendar and create bookings
 */
import { CONFIG } from '@/core/config';
import { useAuthStore, useBookingStore } from '@/core/store';
import { BookingCalendar } from '@/modules/booking/components/BookingCalendar';
import { useBookingData } from '@/modules/booking/hooks/useBookingData';
import {
  createBooking,
  getCalendarAvailability,
  getStoreServices,
} from '@/modules/booking/services/bookingService';
import { CalendarSlot, Service } from '@/modules/booking/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{storeName || 'Store'} Booking</Text>
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
          >
            <Text
              style={[
                styles.serviceButtonText,
                selectedService?.id === service.id && styles.serviceButtonTextActive,
              ]}
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
          <Text style={styles.serviceDescription}>{selectedService.description}</Text>
          {selectedService.durationMinutes && (
            <Text style={styles.serviceDuration}>
              Duration: {selectedService.durationMinutes} minutes
            </Text>
          )}
        </View>
      )}

      {/* Calendar */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
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
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Contact (Phone/Email) *</Text>
              <TextInput
                style={styles.input}
                value={userContact}
                onChangeText={setUserContact}
                placeholder="Enter phone or email"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Any special requests or notes"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBookingModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, submitting && styles.buttonDisabled]}
                onPress={handleCreateBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSelector: {
    maxHeight: 120,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceSelectorContent: {
    padding: 16,
    gap: 12,
  },
  serviceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    minWidth: 150,
  },
  serviceButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceButtonTextActive: {
    color: '#FFF',
  },
  servicePrice: {
    fontSize: 12,
    color: '#666',
  },
  servicePriceActive: {
    color: '#FFF',
  },
  serviceInfo: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#999',
  },
  calendarContainer: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
