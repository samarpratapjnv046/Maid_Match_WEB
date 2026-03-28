import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/src/api/axios';
import { Booking } from '@/src/types';
import BookingCard from '@/components/BookingCard';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

export default function WorkerBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [otpModal, setOtpModal] = useState(false);
  const [otpBookingId, setOtpBookingId] = useState('');
  const [otp, setOtp] = useState('');
  const [isCompletingBooking, setIsCompletingBooking] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings');
      if (response.data.success) {
        const data = response.data.data;
        const list = Array.isArray(data) ? data : data?.bookings || [];
        setBookings(list);
        setFilteredBookings(list);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (selectedStatus === '') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === selectedStatus));
    }
  }, [selectedStatus, bookings]);

  const handleRespond = async (bookingId: string, action: 'accept' | 'reject') => {
    const actionText = action === 'accept' ? 'Accept' : 'Reject';
    Alert.alert(
      `${actionText} Booking`,
      `Are you sure you want to ${action} this booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await api.patch(`/bookings/${bookingId}/respond`, { action });
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId
                    ? { ...b, status: action === 'accept' ? 'accepted' : 'rejected' }
                    : b
                )
              );
              Alert.alert('Success', `Booking ${action}ed successfully`);
            } catch (error: unknown) {
              const err = error as { response?: { data?: { message?: string } } };
              Alert.alert('Error', err?.response?.data?.message || `Failed to ${action} booking`);
            }
          },
        },
      ]
    );
  };

  const handleCompleteWithOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setIsCompletingBooking(true);
    try {
      await api.post(`/bookings/${otpBookingId}/complete`, { otp: otp.trim() });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === otpBookingId ? { ...b, status: 'completed' } : b
        )
      );
      setOtpModal(false);
      setOtp('');
      Alert.alert('Success', 'Booking marked as completed!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Failed to complete booking');
    } finally {
      setIsCompletingBooking(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Filter */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === item.value && styles.filterChipActive]}
            onPress={() => setSelectedStatus(item.value)}
          >
            <Text style={[styles.filterChipText, selectedStatus === item.value && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.filterBar}
      />

      {/* Bookings */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <BookingCard
              booking={item}
              role="worker"
              onPress={() => router.push(`/booking/${item.id}`)}
            />
            {/* Action buttons for pending bookings */}
            {item.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleRespond(item.id, 'reject')}
                >
                  <Ionicons name="close" size={16} color="#FF6B6B" />
                  <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handleRespond(item.id, 'accept')}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Complete button for accepted bookings */}
            {item.status === 'accepted' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.completeBtn]}
                  onPress={() => {
                    setOtpBookingId(item.id);
                    setOtpModal(true);
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B894" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color="#B2BEC3" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>Bookings will appear here once customers book you</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* OTP Modal */}
      <Modal visible={otpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Completion OTP</Text>
              <TouchableOpacity onPress={() => { setOtpModal(false); setOtp(''); }}>
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Ask the customer for the OTP to confirm completion
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor="#B2BEC3"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.completeConfirmBtn, isCompletingBooking && styles.buttonDisabled]}
              onPress={handleCompleteWithOtp}
              disabled={isCompletingBooking}
            >
              {isCompletingBooking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.completeConfirmText}>Confirm Completion</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00B894',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  filterChipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 4,
    paddingBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12,
    marginTop: -8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  acceptBtn: {
    backgroundColor: '#00B894',
  },
  completeBtn: {
    backgroundColor: '#6C5CE7',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636E72',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B2BEC3',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 52,
    fontSize: 20,
    color: '#2D3436',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  completeConfirmBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  completeConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
