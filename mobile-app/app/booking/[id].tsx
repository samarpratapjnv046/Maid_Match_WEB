import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import api from '@/src/api/axios';
import { useAuth } from '@/src/context/AuthContext';
import { useSocket } from '@/src/context/SocketContext';
import { Booking, Message, SERVICE_TYPES } from '@/src/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FDCB6E',
  accepted: '#6C5CE7',
  rejected: '#FF6B6B',
  cancelled: '#B2BEC3',
  ongoing: '#00B894',
  completed: '#00B894',
  payment_pending: '#E17055',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const flatListRef = useRef<FlatList>(null);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadBooking = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/${id}`);
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch {
      Alert.alert('Error', 'Failed to load booking');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadMessages = useCallback(async () => {
    try {
      const response = await api.get(`/chat/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setMessages(Array.isArray(data) ? data : data?.messages || []);
        // Mark as read
        await api.post(`/chat/${id}/read`).catch(() => {});
      }
    } catch {
      // silently fail
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
    loadMessages();
  }, [loadBooking, loadMessages]);

  // Socket.IO chat
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join', id);

    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket, id]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    const text = messageText.trim();
    setMessageText('');
    setIsSendingMessage(true);

    try {
      // Send via socket
      if (socket?.connected) {
        socket.emit('message', { bookingId: id, text });
      } else {
        // Fallback to REST
        const response = await api.post(`/chat/${id}`, { text });
        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.data]);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to send message');
      setMessageText(text);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/bookings/${id}/cancel`);
            setBooking((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
            Alert.alert('Cancelled', 'Your booking has been cancelled');
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            Alert.alert('Error', err?.response?.data?.message || 'Failed to cancel booking');
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true);
    try {
      await api.post(`/bookings/${id}/review`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setShowReviewModal(false);
      Alert.alert('Thanks!', 'Your review has been submitted');
      loadBooking();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCustomer = user?.mode === 'customer' || user?.id === booking?.customer_id;
  const otherPerson = isCustomer ? booking?.worker : booking?.customer;
  const otherName = isCustomer
    ? booking?.worker?.name || 'Worker'
    : (booking?.customer as { name?: string })?.name || 'Customer';

  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=6C5CE7&color=fff&size=100`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!booking) return null;

  const statusColor = STATUS_COLORS[booking.status] || '#B2BEC3';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: avatarUri }} style={styles.headerAvatar} contentFit="cover" />
          <View>
            <Text style={styles.headerName}>{otherName}</Text>
            <Text style={styles.headerBookingId}>Booking #{id.slice(-8).toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? (
        <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
          {/* Service Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Information</Text>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={16} color="#6C5CE7" />
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>
                {SERVICE_TYPES.find((s) => s.value === booking.service_type)?.label ||
                  booking.service_type}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6C5CE7" />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{booking.duration_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6C5CE7" />
              <Text style={styles.detailLabel}>Start Time</Text>
              <Text style={styles.detailValue}>{formatDateTime(booking.start_time)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6C5CE7" />
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{booking.address}</Text>
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#00B894" />
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>₹{booking.amount?.toLocaleString() || 0}</Text>
            </View>
            {booking.discount && booking.discount > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="pricetag-outline" size={16} color="#00B894" />
                <Text style={styles.detailLabel}>Discount</Text>
                <Text style={[styles.detailValue, { color: '#00B894' }]}>
                  -₹{booking.discount}
                </Text>
              </View>
            )}
            {booking.final_amount && (
              <View style={[styles.detailRow, styles.totalDetailRow]}>
                <Ionicons name="wallet-outline" size={16} color="#6C5CE7" />
                <Text style={[styles.detailLabel, { fontWeight: '700' }]}>Total</Text>
                <Text style={[styles.detailValue, styles.totalDetailValue]}>
                  ₹{booking.final_amount?.toLocaleString()}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#00B894" />
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailValue}>{booking.payment_status || 'Pending'}</Text>
            </View>
          </View>

          {/* Status Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Status Timeline</Text>
            <View style={styles.timeline}>
              {[
                { status: 'pending', label: 'Booking Placed', icon: 'time' },
                { status: 'accepted', label: 'Accepted by Worker', icon: 'checkmark-circle' },
                { status: 'ongoing', label: 'Service Ongoing', icon: 'play-circle' },
                { status: 'completed', label: 'Service Completed', icon: 'star' },
              ].map((step, index) => {
                const isActive =
                  ['pending', 'accepted', 'ongoing', 'completed'].indexOf(booking.status) >=
                  ['pending', 'accepted', 'ongoing', 'completed'].indexOf(step.status);
                return (
                  <View key={step.status} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isActive && styles.timelineCircleActive,
                        ]}
                      >
                        <Ionicons
                          name={step.icon as never}
                          size={14}
                          color={isActive ? '#FFFFFF' : '#B2BEC3'}
                        />
                      </View>
                      {index < 3 && (
                        <View
                          style={[styles.timelineLine, isActive && styles.timelineLineActive]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isActive && styles.timelineLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review Section */}
          {booking.status === 'completed' && isCustomer && !booking.review && (
            <TouchableOpacity style={styles.reviewButton} onPress={() => setShowReviewModal(true)}>
              <Ionicons name="star-outline" size={18} color="#FFFFFF" />
              <Text style={styles.reviewButtonText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

          {booking.review && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Review</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= booking.review!.rating ? 'star' : 'star-outline'}
                    size={20}
                    color="#FDCB6E"
                  />
                ))}
              </View>
              {booking.review.comment && (
                <Text style={styles.reviewComment}>{booking.review.comment}</Text>
              )}
            </View>
          )}

          {/* Cancel Action */}
          {['pending', 'accepted'].includes(booking.status) && isCustomer && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>
              <Ionicons name="close-circle-outline" size={18} color="#FF6B6B" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      ) : (
        // Chat Tab
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMine = item.sender_id === user?.id;
              return (
                <View style={[styles.messageBubble, isMine && styles.messageBubbleMine]}>
                  <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>
                    {new Date(item.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.chatEmpty}>
                <Ionicons name="chatbubbles-outline" size={40} color="#B2BEC3" />
                <Text style={styles.chatEmptyText}>No messages yet</Text>
                <Text style={styles.chatEmptySubtext}>Start the conversation</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor="#B2BEC3"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!messageText.trim() || isSendingMessage) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim() || isSendingMessage}
            >
              {isSendingMessage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            <View style={styles.starSelector}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                  <Ionicons
                    name={s <= reviewRating ? 'star' : 'star-outline'}
                    size={36}
                    color="#FDCB6E"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Share your experience (optional)..."
              placeholderTextColor="#B2BEC3"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.submitReviewBtn, isSubmittingReview && styles.buttonDisabled]}
              onPress={handleSubmitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    backgroundColor: '#6C5CE7',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerBookingId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C5CE7',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B2BEC3',
  },
  tabTextActive: {
    color: '#6C5CE7',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#636E72',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    flex: 2,
    textAlign: 'right',
  },
  totalDetailRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalDetailValue: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  timeline: {
    gap: 0,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCircleActive: {
    backgroundColor: '#6C5CE7',
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: '#F0F0F0',
    marginTop: 2,
  },
  timelineLineActive: {
    backgroundColor: '#6C5CE7',
  },
  timelineLabel: {
    fontSize: 13,
    color: '#B2BEC3',
    paddingTop: 7,
    marginBottom: 16,
  },
  timelineLabelActive: {
    color: '#2D3436',
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#FDCB6E',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginTop: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,107,107,0.05)',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
  // Chat
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesList: {
    padding: 16,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  messageBubbleMine: {
    backgroundColor: '#6C5CE7',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#B2BEC3',
    marginTop: 4,
    textAlign: 'right',
  },
  messageTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  chatEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  chatEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  chatEmptySubtext: {
    fontSize: 13,
    color: '#B2BEC3',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B2BEC3',
  },
  // Review Modal
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  starSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  reviewInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    fontSize: 14,
    color: '#2D3436',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: '#FDCB6E',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitReviewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
