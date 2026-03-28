import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/api/axios';
import { Offer, Worker } from '@/src/types';
import WorkerCard from '@/components/WorkerCard';
import OfferCard from '@/components/OfferCard';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [offersRes, workersRes] = await Promise.all([
        api.get('/offers'),
        api.get('/workers/search?page=1'),
      ]);

      if (offersRes.data.success) {
        setOffers(offersRes.data.data || []);
      }
      if (workersRes.data.success) {
        const data = workersRes.data.data;
        setFeaturedWorkers(Array.isArray(data) ? data.slice(0, 6) : data?.workers?.slice(0, 6) || []);
      }
    } catch {
      // silently fail — show empty state
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const serviceCategories = [
    { icon: 'sparkles', label: 'Cleaning', value: 'cleaning' },
    { icon: 'flame', label: 'Cooking', value: 'cooking' },
    { icon: 'shirt', label: 'Laundry', value: 'laundry' },
    { icon: 'happy', label: 'Childcare', value: 'childcare' },
    { icon: 'heart', label: 'Eldercare', value: 'eldercare' },
    { icon: 'leaf', label: 'Gardening', value: 'gardening' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Find your perfect home helper</Text>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => router.push('/(customer)/bookings')}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(customer)/search')}>
        <Ionicons name="search-outline" size={20} color="#636E72" />
        <Text style={styles.searchPlaceholder}>Search workers by service or location...</Text>
      </TouchableOpacity>

      {/* Offers */}
      {offers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <FlatList
            data={offers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OfferCard offer={item} />}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Service</Text>
        <View style={styles.categoryGrid}>
          {serviceCategories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={styles.categoryCard}
              onPress={() =>
                router.push({
                  pathname: '/(customer)/search',
                  params: { service: cat.value },
                })
              }
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon as never} size={24} color="#6C5CE7" />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Workers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Workers</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#6C5CE7" style={styles.loader} />
        ) : featuredWorkers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color="#B2BEC3" />
            <Text style={styles.emptyText}>No workers available yet</Text>
          </View>
        ) : (
          featuredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onPress={() => router.push(`/worker/${worker.id}`)}
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
  header: {
    backgroundColor: '#6C5CE7',
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -28,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 10,
  },
  searchPlaceholder: {
    color: '#B2BEC3',
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
    gap: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  loader: {
    marginTop: 24,
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
