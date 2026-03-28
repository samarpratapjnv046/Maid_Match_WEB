import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Offer } from '@/src/types';

interface OfferCardProps {
  offer: Offer;
  onPress?: () => void;
}

const GRADIENTS = [
  { bg: '#6C5CE7', accent: '#A29BFE' },
  { bg: '#00B894', accent: '#55EFC4' },
  { bg: '#E17055', accent: '#FAB1A0' },
  { bg: '#0984E3', accent: '#74B9FF' },
  { bg: '#6D4C41', accent: '#A1887F' },
];

export default function OfferCard({ offer, onPress }: OfferCardProps) {
  const colorIndex = (offer.title?.charCodeAt(0) || 0) % GRADIENTS.length;
  const colors = GRADIENTS[colorIndex];

  const discountText = offer.discount_percent
    ? `${offer.discount_percent}% OFF`
    : offer.discount_amount
    ? `₹${offer.discount_amount} OFF`
    : 'Special Offer';

  const handleCopyCode = () => {
    if (offer.code) {
      Clipboard.setString(offer.code);
      Alert.alert('Copied!', `Coupon code "${offer.code}" copied to clipboard`);
    }
  };

  const validUntil = offer.valid_until
    ? new Date(offer.valid_until).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Decorative circles */}
      <View style={[styles.circle1, { backgroundColor: colors.accent }]} />
      <View style={[styles.circle2, { backgroundColor: colors.accent }]} />

      {/* Discount Badge */}
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{discountText}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{offer.title}</Text>
        {offer.description && (
          <Text style={styles.description} numberOfLines={2}>
            {offer.description}
          </Text>
        )}

        {offer.code && (
          <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode}>
            <Text style={styles.codeLabel}>CODE</Text>
            <Text style={styles.code}>{offer.code}</Text>
            <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}

        {validUntil && (
          <View style={styles.validRow}>
            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.validText}>Valid until {validUntil}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -30,
    right: -20,
    opacity: 0.3,
  },
  circle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: -20,
    right: 20,
    opacity: 0.2,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    gap: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  code: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  validText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
});
