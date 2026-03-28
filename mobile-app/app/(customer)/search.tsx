import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/src/api/axios';
import { Worker, SERVICE_TYPES } from '@/src/types';
import WorkerCard from '@/components/WorkerCard';

const DURATION_FILTERS = [
  { value: '', label: 'Any' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ service?: string }>();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(params.service || '');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchWorkers = useCallback(
    async (reset = false) => {
      if (isLoading && !reset) return;

      const currentPage = reset ? 1 : page;
      setIsLoading(true);

      try {
        const params: Record<string, string> = {
          page: String(currentPage),
        };
        if (searchQuery.trim()) params.location = searchQuery.trim();
        if (selectedService) params.service = selectedService;
        if (selectedDuration) params.duration = selectedDuration;

        const query = new URLSearchParams(params).toString();
        const response = await api.get(`/workers/search?${query}`);

        if (response.data.success) {
          const data = response.data.data;
          const newWorkers = Array.isArray(data) ? data : data?.workers || [];

          if (reset) {
            setWorkers(newWorkers);
            setPage(2);
          } else {
            setWorkers((prev) => [...prev, ...newWorkers]);
            setPage((p) => p + 1);
          }
          setHasMore(newWorkers.length === 10);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, selectedService, selectedDuration, page, isLoading]
  );

  useEffect(() => {
    searchWorkers(true);
  }, [selectedService, selectedDuration]);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    searchWorkers(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    searchWorkers(true);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      searchWorkers(false);
    }
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator color="#6C5CE7" style={styles.footerLoader} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Workers</Text>

        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#636E72" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location or name..."
            placeholderTextColor="#B2BEC3"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#B2BEC3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Service Filter Chips */}
      <View style={styles.filtersSection}>
        <FlatList
          data={[{ value: '', label: 'All' }, ...SERVICE_TYPES]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedService === item.value && styles.chipActive]}
              onPress={() => setSelectedService(item.value)}
            >
              <Text style={[styles.chipText, selectedService === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Duration Filter */}
        <FlatList
          data={DURATION_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={[styles.chips, { marginTop: 8 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                styles.chipSmall,
                selectedDuration === item.value && styles.chipActive,
              ]}
              onPress={() => setSelectedDuration(item.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  styles.chipTextSmall,
                  selectedDuration === item.value && styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      {!isLoading && (
        <Text style={styles.resultsCount}>
          {workers.length} worker{workers.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Workers List */}
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            onPress={() => router.push(`/worker/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#B2BEC3" />
              <Text style={styles.emptyTitle}>No workers found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#6C5CE7',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#2D3436',
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  chipTextSmall: {
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 13,
    color: '#636E72',
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  footerLoader: {
    marginVertical: 16,
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
  },
});
