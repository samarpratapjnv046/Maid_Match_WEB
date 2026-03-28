import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import api from '@/src/api/axios';
import { Worker, SERVICE_TYPES, DURATION_TYPES, DurationType } from '@/src/types';

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  // Booking form
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('hourly');
  const [startDate, setStartDate] = useState('');
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const loadWorker = useCallback(async () => {
    try {
      const response = await api.get(`/workers/${id}`);
      if (response.data.success) {
        const w = response.data.data;
        setWorker(w);
        setIsFavorite(w.is_favorite || false);
        if (w.services?.length > 0) setSelectedService(w.services[0]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load worker profile');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorker();
  }, [loadWorker]);

  const handleToggleFavorite = async () => {
    setIsTogglingFav(true);
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite((prev) => !prev);
    } catch {
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setIsTogglingFav(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }
    if (!startDate.trim()) {
      Alert.alert('Error', 'Please enter a start date/time');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }

    setIsBooking(true);
    try {
      const payload: Record<string, unknown> = {
        worker_id: id,
        service_type: selectedService,
        duration_type: selectedDuration,
        start_time: new Date(startDate).toISOString(),
        address: address.trim(),
      };
      if (couponCode.trim()) payload.coupon_code = couponCode.trim();

      const response = await api.post('/bookings', payload);
      if (response.data.success) {
        const booking = response.data.data;
        setCreatedBookingId(booking.id || booking.booking_id);
        setShowBookingModal(false);
        setShowPaymentModal(true);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Booking Failed', err?.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCreatePaymentOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const response = await api.post('/payments/create-order', {
        booking_id: createdBookingId,
      });
      if (response.data.success) {
        const order = response.data.data;
        setRazorpayOrderId(order.order_id || order.id);
        Alert.alert(
          'Payment Order Created',
          `Order ID: ${order.order_id || order.id}\n\nIn a production app, the Razorpay payment gateway would open here. Your booking has been confirmed.`,
          [
            {
              text: 'View Booking',
              onPress: () => {
                setShowPaymentModal(false);
                router.push(`/booking/${createdBookingId}`);
              },
            },
          ]
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create payment order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getPrice = () => {
    if (!worker) return 0;
    if (selectedDuration === 'hourly') return worker.pricing?.hourly || 0;
    if (selectedDuration === 'daily') return worker.pricing?.daily || 0;
    if (selectedDuration === 'monthly') return worker.pricing?.monthly || 0;
    return 0;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!worker) return null;

  const avatarUri = worker.avatar
    ? worker.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=6C5CE7&color=fff&size=200`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#2D3436" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favButton}
            onPress={handleToggleFavorite}
            disabled={isTogglingFav}
          >
            {isTogglingFav ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FF6B6B" />
            )}
          </TouchableOpacity>

          <Image source={{ uri: avatarUri }} style={styles.workerImage} contentFit="cover" />
        </View>

        {/* Worker Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <View>
              <Text style={styles.workerName}>{worker.name}</Text>
              {worker.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#636E72" />
                  <Text style={styles.locationText}>{worker.location}</Text>
                </View>
              )}
            </View>
            <View style={styles.availabilityBadge}>
              <View style={[styles.availDot, worker.is_available && styles.availDotActive]} />
              <Text style={[styles.availText, worker.is_available && styles.availTextActive]}>
                {worker.is_available ? 'Available' : 'Busy'}
              </Text>
            </View>
          </View>

          {/* Rating + Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FDCB6E" />
              <Text style={styles.statValue}>{worker.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statMeta}>({worker.total_reviews || 0})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color="#6C5CE7" />
              <Text style={styles.statValue}>{worker.total_bookings || 0}</Text>
              <Text style={styles.statMeta}>jobs</Text>
            </View>
            {worker.experience_years !== undefined && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#00B894" />
                  <Text style={styles.statValue}>{worker.experience_years}yr</Text>
                  <Text style={styles.statMeta}>exp</Text>
                </View>
              </>
            )}
          </View>

          {/* Bio */}
          {worker.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{worker.bio}</Text>
            </View>
          )}

          {/* Services */}
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.tagsRow}>
              {(worker.services || []).map((s) => (
                <View key={s} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>
                    {SERVICE_TYPES.find((t) => t.value === s)?.label || s}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingCards}>
              {worker.pricing?.hourly && (
                <View style={styles.priceCard}>
                  <Text style={styles.priceAmount}>₹{worker.pricing.hourly}</Text>
                  <Text style={styles.priceUnit}>/ hour</Text>
                </View>
              )}
              {worker.pricing?.daily && (
                <View style={styles.priceCard}>
                  <Text style={styles.priceAmount}>₹{worker.pricing.daily}</Text>
                  <Text style={styles.priceUnit}>/ day</Text>
                </View>
              )}
              {worker.pricing?.monthly && (
                <View style={styles.priceCard}>
                  <Text style={styles.priceAmount}>₹{worker.pricing.monthly}</Text>
                  <Text style={styles.priceUnit}>/ month</Text>
                </View>
              )}
            </View>
          </View>

          {/* Languages */}
          {worker.languages && worker.languages.length > 0 && (
            <View style={styles.infoBlock}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <Text style={styles.langText}>{worker.languages.join(', ')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Starting from</Text>
          <Text style={styles.footerPriceValue}>
            ₹{worker.pricing?.hourly || worker.pricing?.daily || worker.pricing?.monthly || 0}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !worker.is_available && styles.bookButtonDisabled]}
          onPress={() => setShowBookingModal(true)}
          disabled={!worker.is_available}
        >
          <Text style={styles.bookButtonText}>
            {worker.is_available ? 'Book Now' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book {worker.name}</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service */}
              <Text style={styles.fieldLabel}>Select Service</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {(worker.services || []).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, selectedService === s && styles.chipActive]}
                    onPress={() => setSelectedService(s)}
                  >
                    <Text style={[styles.chipText, selectedService === s && styles.chipTextActive]}>
                      {SERVICE_TYPES.find((t) => t.value === s)?.label || s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Duration */}
              <Text style={styles.fieldLabel}>Duration Type</Text>
              <View style={styles.durationRow}>
                {DURATION_TYPES.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[
                      styles.durationChip,
                      selectedDuration === d.value && styles.durationChipActive,
                    ]}
                    onPress={() => setSelectedDuration(d.value)}
                  >
                    <Text style={[styles.durationText, selectedDuration === d.value && styles.durationTextActive]}>
                      {d.label}
                    </Text>
                    {worker.pricing?.[d.value] && (
                      <Text style={[styles.durationPrice, selectedDuration === d.value && styles.durationTextActive]}>
                        ₹{worker.pricing[d.value]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date/Time */}
              <Text style={styles.fieldLabel}>Start Date & Time</Text>
              <TextInput
                style={styles.fieldInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD HH:MM (e.g. 2026-03-30 09:00)"
                placeholderTextColor="#B2BEC3"
              />

              {/* Address */}
              <Text style={styles.fieldLabel}>Service Address</Text>
              <TextInput
                style={[styles.fieldInput, { height: 70, paddingTop: 10, textAlignVertical: 'top' }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your full address"
                placeholderTextColor="#B2BEC3"
                multiline
              />

              {/* Coupon */}
              <Text style={styles.fieldLabel}>Coupon Code (optional)</Text>
              <TextInput
                style={styles.fieldInput}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter coupon code"
                placeholderTextColor="#B2BEC3"
                autoCapitalize="characters"
              />

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.priceSummaryLabel}>Service</Text>
                  <Text style={styles.priceSummaryValue}>
                    {SERVICE_TYPES.find((s) => s.value === selectedService)?.label || selectedService}
                  </Text>
                </View>
                <View style={styles.priceSummaryRow}>
                  <Text style={styles.priceSummaryLabel}>Duration Type</Text>
                  <Text style={styles.priceSummaryValue}>
                    {DURATION_TYPES.find((d) => d.value === selectedDuration)?.label}
                  </Text>
                </View>
                <View style={[styles.priceSummaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Estimated Price</Text>
                  <Text style={styles.totalValue}>₹{getPrice()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmBookBtn, isBooking && styles.buttonDisabled]}
                onPress={handleCreateBooking}
                disabled={isBooking}
              >
                {isBooking ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBookText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentModal(false);
                  if (createdBookingId) router.push(`/booking/${createdBookingId}`);
                }}
              >
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentInfo}>
              <Ionicons name="checkmark-circle" size={56} color="#00B894" />
              <Text style={styles.paymentTitle}>Booking Created!</Text>
              <Text style={styles.paymentSubtitle}>
                Your booking has been placed. Complete payment to confirm.
              </Text>
              {razorpayOrderId && (
                <Text style={styles.orderId}>Order: {razorpayOrderId}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.payNowBtn, isCreatingOrder && styles.buttonDisabled]}
              onPress={handleCreatePaymentOrder}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.payNowText}>Pay Now</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payLaterBtn}
              onPress={() => {
                setShowPaymentModal(false);
                if (createdBookingId) router.push(`/booking/${createdBookingId}`);
              }}
            >
              <Text style={styles.payLaterText}>Pay Later / View Booking</Text>
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
  heroSection: {
    height: 260,
    backgroundColor: '#E0D9FF',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingBottom: 100,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#636E72',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  availDotActive: {
    backgroundColor: '#00B894',
  },
  availText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B2BEC3',
  },
  availTextActive: {
    color: '#00B894',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  statMeta: {
    fontSize: 12,
    color: '#636E72',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  bioSection: {
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
    marginTop: 8,
  },
  infoBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceTagText: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  pricingCards: {
    flexDirection: 'row',
    gap: 10,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  priceUnit: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 2,
  },
  langText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 28,
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: '#B2BEC3',
    fontWeight: '500',
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3436',
  },
  bookButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonDisabled: {
    backgroundColor: '#B2BEC3',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  chipScroll: {
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  chipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  durationText: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '600',
  },
  durationPrice: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 2,
  },
  durationTextActive: {
    color: '#FFFFFF',
  },
  fieldInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#2D3436',
  },
  priceSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceSummaryLabel: {
    fontSize: 13,
    color: '#636E72',
  },
  priceSummaryValue: {
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  confirmBookBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  confirmBookText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  paymentInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  orderId: {
    fontSize: 12,
    color: '#B2BEC3',
    fontFamily: 'monospace',
  },
  payNowBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  payLaterBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payLaterText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '600',
  },
});
