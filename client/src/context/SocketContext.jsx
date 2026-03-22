import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  // { [bookingId]: number }  — live unread counts per booking
  const [unreadCounts, setUnreadCounts] = useState({});

  // Notification popup queue: [{ id, bookingId, senderName, senderRole, senderPhoto, text, unreadCount }]
  const [notifications, setNotifications] = useState([]);

  // Which booking's chat window is currently open → suppress its popup
  const activeChatBookingId = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAllNotifications = useCallback(() => setNotifications([]), []);

  // Clear badge + notifications for a booking (called when its chat window opens)
  const markLocalRead = useCallback((bookingId) => {
    setUnreadCounts((prev) => {
      if (!prev[bookingId]) return prev;
      const next = { ...prev };
      delete next[bookingId];
      return next;
    });
    setNotifications((prev) => prev.filter((n) => n.bookingId !== bookingId));
  }, []);

  // Register which booking chat is open (+ immediately clear its unread)
  const setActiveChatBooking = useCallback((bookingId) => {
    activeChatBookingId.current = bookingId;
    if (bookingId) markLocalRead(bookingId);
  }, [markLocalRead]);

  // ── Fetch unread on login / refresh ──────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/unread');
      const items = data.data || [];

      const counts = {};
      const startupPopups = [];

      for (const item of items) {
        counts[item.bookingId] = item.unreadCount;

        if (item.latestMessage) {
          const msg = item.latestMessage;
          startupPopups.push({
            id: `startup-${item.bookingId}`,
            bookingId: item.bookingId,
            senderName: msg.sender_id?.name || 'Someone',
            senderRole: msg.sender_role,
            senderPhoto: msg.sender_id?.profilePhoto?.url || null,
            text: item.unreadCount > 1
              ? `${item.unreadCount} unread messages`
              : msg.text,
            unreadCount: item.unreadCount,
          });
        }
      }

      setUnreadCounts(counts);
      if (startupPopups.length) setNotifications(startupPopups.slice(0, 5));
    } catch {
      // silent — not critical
    }
  }, []);

  // ── Socket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setUnreadCounts({});
      setNotifications([]);
      return;
    }

    // Show unread popups as soon as user session is known
    fetchUnread();

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(SERVER_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('chat_notification', (data) => {
      const { bookingId, messageId } = data;

      // Bump the unread count for this booking
      setUnreadCounts((prev) => ({
        ...prev,
        [bookingId]: (prev[bookingId] || 0) + 1,
      }));

      // Don't show a popup if the user already has that chat open
      if (activeChatBookingId.current === bookingId) return;

      const popup = {
        id: `${bookingId}-${messageId}`,
        bookingId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        senderPhoto: data.senderPhoto,
        text: data.text,
        unreadCount: null,
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.id === popup.id)) return prev;
        // One popup per booking at a time — replace older one for same booking
        const filtered = prev.filter((n) => n.bookingId !== bookingId);
        return [popup, ...filtered].slice(0, 5);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchUnread]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef,
        notifications,
        unreadCounts,
        dismissNotification,
        dismissAllNotifications,
        setActiveChatBooking,
        markLocalRead,
        fetchUnread,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
