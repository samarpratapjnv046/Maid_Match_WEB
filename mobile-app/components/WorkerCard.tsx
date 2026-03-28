import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Worker, SERVICE_TYPES } from '@/src/types';

interface WorkerCardProps {
  worker: Worker;
  onPress: () => void;
  compact?: boolean;
}

export default function WorkerCard({ worker, onPress, compact = false }: WorkerCardProps) {
  const avatarUri = worker.avatar
    ? worker.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=6C5CE7&color=fff&size=120`;

  const serviceLabels = (worker.services || [])
    .slice(0, 2)
    .map((s) => SERVICE_TYPES.find((t) => t.value === s)?.label || s);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: avatarUri }} style={styles.compactAvatar} contentFit="cover" />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{worker.name}</Text>
          <Text style={styles.compactService} numberOfLines={1}>{serviceLabels.join(', ')}</Text>
          <View style={styles.compactRating}>
            <Ionicons name="star" size={12} color="#FDCB6E" />
            <Text style={styles.compactRatingText}>{worker.rating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
        <View style={styles.compactPriceCol}>
          <Text style={styles.compactPrice}>
            ₹{worker.pricing?.hourly || worker.pricing?.daily || worker.pricing?.monthly || 0}
          </Text>
          <Text style={styles.compactPriceUnit}>
            {worker.pricing?.hourly ? '/hr' : worker.pricing?.daily ? '/day' : '/mo'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          {worker.is_available && <View style={styles.availableDot} />}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{worker.name}</Text>
          <View style={styles.serviceRow}>
            {serviceLabels.map((label, i) => (
              <View key={i} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>{label}</Text>
              </View>
            ))}
            {(worker.services || []).length > 2 && (
              <View style={[styles.serviceChip, styles.moreChip]}>
                <Text style={styles.serviceChipText}>+{worker.services.length - 2}</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.ratingGroup}>
              <Ionicons name="star" size={13} color="#FDCB6E" />
              <Text style={styles.ratingText}>{worker.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.reviewCount}>({worker.total_reviews || 0})</Text>
            </View>
            {worker.distance !== undefined && (
              <>
                <View style={styles.dot} />
                <View style={styles.distGroup}>
                  <Ionicons name="location-outline" size={12} color="#636E72" />
                  <Text style={styles.distText}>{worker.distance.toFixed(1)} km</Text>
                </View>
              </>
            )}
            {worker.experience_years !== undefined && (
              <>
                <View style={styles.dot} />
                <Text style={styles.expText}>{worker.experience_years}yr exp</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.priceBlock}>
          {worker.pricing?.hourly && (
            <Text style={styles.price}>₹{worker.pricing.hourly}<Text style={styles.priceUnit}>/hr</Text></Text>
          )}
          {!worker.pricing?.hourly && worker.pricing?.daily && (
            <Text style={styles.price}>₹{worker.pricing.daily}<Text style={styles.priceUnit}>/day</Text></Text>
          )}
        </View>
        <View style={[styles.statusBadge, worker.is_available ? styles.availBadge : styles.busyBadge]}>
          <Text style={[styles.statusText, worker.is_available ? styles.availText : styles.busyText]}>
            {worker.is_available ? 'Available' : 'Busy'}
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
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0D9FF',
  },
  availableDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00B894',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  serviceChip: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moreChip: {
    backgroundColor: '#F0F0F0',
  },
  serviceChipText: {
    fontSize: 11,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3436',
  },
  reviewCount: {
    fontSize: 11,
    color: '#B2BEC3',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#B2BEC3',
  },
  distGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distText: {
    fontSize: 12,
    color: '#636E72',
  },
  expText: {
    fontSize: 12,
    color: '#636E72',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  priceBlock: {},
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#B2BEC3',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  availBadge: {
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
  },
  busyBadge: {
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  availText: {
    color: '#00B894',
  },
  busyText: {
    color: '#B2BEC3',
  },
  // Compact variant
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  compactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0D9FF',
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  compactService: {
    fontSize: 12,
    color: '#636E72',
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
  },
  compactPriceCol: {
    alignItems: 'flex-end',
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  compactPriceUnit: {
    fontSize: 11,
    color: '#B2BEC3',
  },
});
