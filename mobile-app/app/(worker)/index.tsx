import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/api/axios';
import { Booking } from '@/src/types';
import BookingCard from '@/components/BookingCard';

interface WorkerStats {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_earnings: number;
  rating: number;
  is_available: boolean;
}

export default function WorkerDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        api.get(`/workers/profile`).catch(() => null),
        api.get('/bookings?limit=3'),
      ]);

      if (profileRes?.data?.success) {
        const profile = profileRes.data.data;
        setStats({
          total_bookings: profile.total_bookings || 0,
          completed_bookings: profile.completed_bookings || 0,
          pending_bookings: profile.pending_bookings || 0,
          total_earnings: profile.total_earnings || 0,
          rating: profile.rating || 0,
          is_available: profile.is_available || false,
        });
      }

      if (bookingsRes.data.success) {
        const data = bookingsRes.data.data;
        const list = Array.isArray(data) ? data : data?.bookings || [];
        setRecentBookings(list.slice(0, 3));
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const toggleAvailability = async () => {
    if (!stats) return;
    setTogglingAvailability(true);
    try {
      const response = await api.patch('/workers/profile/availability');
      if (response.data.success) {
        setStats((prev) =>
          prev ? { ...prev, is_available: !prev.is_available } : prev
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to update availability');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const avatarUri = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Worker')}&background=00B894&color=fff&size=200`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B894" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          <View style={styles.profileInfo}>
            <Text style={styles.workerName}>{user?.name}</Text>
            <Text style={styles.workerEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityLeft}>
            <View style={[styles.availabilityDot, stats?.is_available && styles.dotActive]} />
            <View>
              <Text style={styles.availabilityTitle}>
                {stats?.is_available ? 'Available for Work' : 'Not Available'}
              </Text>
              <Text style={styles.availabilitySubtitle}>Toggle to receive new bookings</Text>
            </View>
          </View>
          {togglingAvailability ? (
            <ActivityIndicator color="#00B894" />
          ) : (
            <Switch
              value={stats?.is_available || false}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#E0E0E0', true: 'rgba(0,184,148,0.3)' }}
              thumbColor={stats?.is_available ? '#00B894' : '#B2BEC3'}
            />
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#6C5CE7" />
          <Text style={styles.statValue}>{stats?.total_bookings || 0}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#00B894" />
          <Text style={styles.statValue}>{stats?.completed_bookings || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={24} color="#FDCB6E" />
          <Text style={styles.statValue}>{stats?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color="#E17055" />
          <Text style={styles.statValue}>₹{stats?.total_earnings || 0}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/bookings')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color="#B2BEC3" />
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        ) : (
          recentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role="worker"
              onPress={() => router.push(`/booking/${booking.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 24,
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
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  workerEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  availabilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#00B894',
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  availabilitySubtitle: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  seeAll: {
    fontSize: 13,
    color: '#00B894',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#B2BEC3',
  },
});
