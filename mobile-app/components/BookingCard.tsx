import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking, BookingStatus, SERVICE_TYPES } from '@/src/types';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  role?: 'customer' | 'worker';
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: { label: 'Pending', color: '#F39C12', bg: '#FFF8E7', icon: 'time-outline' },
  accepted: { label: 'Accepted', color: '#6C5CE7', bg: '#F0EEFF', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', color: '#E74C3C', bg: '#FFF0EE', icon: 'close-circle-outline' },
  cancelled: { label: 'Cancelled', color: '#B2BEC3', bg: '#F5F5F5', icon: 'ban-outline' },
  ongoing: { label: 'Ongoing', color: '#00B894', bg: '#E8F8F5', icon: 'play-circle-outline' },
  completed: { label: 'Completed', color: '#2ECC71', bg: '#EAFAF1', icon: 'checkmark-done-circle-outline' },
  payment_pending: { label: 'Payment Due', color: '#E67E22', bg: '#FEF9E7', icon: 'card-outline' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function BookingCard({ booking, onPress, role = 'customer' }: BookingCardProps) {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const serviceLabel = SERVICE_TYPES.find((s) => s.value === booking.service_type)?.label || booking.service_type;
  const displayName = role === 'customer' ? booking.worker?.name : booking.customer?.name;
  const displayRole = role === 'customer' ? 'Worker' : 'Customer';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
        <View style={styles.statusLeft}>
          <Ionicons name={status.icon as never} size={16} color={status.color} />
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.bookingDate}>{formatDate(booking.created_at)}</Text>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Service + Person */}
        <View style={styles.mainRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="briefcase-outline" size={22} color="#6C5CE7" />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.serviceName}>{serviceLabel}</Text>
            {displayName && (
              <Text style={styles.personName}>
                {displayRole}: <Text style={styles.personNameBold}>{displayName}</Text>
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B2BEC3" />
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={13} color="#636E72" />
            <Text style={styles.detailText}>{formatDate(booking.start_time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={13} color="#636E72" />
            <Text style={styles.detailText}>{formatTime(booking.start_time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="repeat-outline" size={13} color="#636E72" />
            <Text style={styles.detailText} style={{ textTransform: 'capitalize' }}>
              {booking.duration_type}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            ₹{booking.final_amount ?? booking.amount ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingDate: {
    fontSize: 11,
    color: '#B2BEC3',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  personName: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  personNameBold: {
    fontWeight: '600',
    color: '#2D3436',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#636E72',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  amountLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C5CE7',
  },
});
