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

  // { [bookingId]: number }  — live unread counts per booking (chat)
  const [unreadCounts, setUnreadCounts] = useState({});

  // Chat notification popup queue
  const [notifications, setNotifications] = useState([]);

  // System notifications (booking, OTP, verification, etc.)
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [systemUnreadCount, setSystemUnreadCount] = useState(0);

  // Which booking's chat window is currently open → suppress its popup
  const activeChatBookingId = useRef(null);

  // ── Chat helpers ─────────────────────────────────────────────────────────────

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAllNotifications = useCallback(() => setNotifications([]), []);

  const markLocalRead = useCallback((bookingId) => {
    setUnreadCounts((prev) => {
      if (!prev[bookingId]) return prev;
      const next = { ...prev };
      delete next[bookingId];
      return next;
    });
    setNotifications((prev) => prev.filter((n) => n.bookingId !== bookingId));
  }, []);

  const setActiveChatBooking = useCallback((bookingId) => {
    activeChatBookingId.current = bookingId;
    if (bookingId) markLocalRead(bookingId);
  }, [markLocalRead]);

  // ── System notification helpers ───────────────────────────────────────────────

  const markSystemNotifRead = useCallback(async (id) => {
    setSystemNotifications((prev) => {
      const notif = prev.find((n) => n._id === id);
      if (!notif) return prev;
      if (notif.type === 'otp') {
        // OTP: mark as read but keep in list until booking completes
        return prev.map((n) => (n._id === id ? { ...n, is_read: true } : n));
      }
      // All other types: remove from state immediately (deleted from DB too)
      return prev.filter((n) => n._id !== id);
    });
    setSystemUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // silent
    }
  }, []);

  const markAllSystemRead = useCallback(async () => {
    setSystemNotifications((prev) =>
      // Remove non-OTP; keep OTP but mark as read
      prev.filter((n) => n.type === 'otp').map((n) => ({ ...n, is_read: true }))
    );
    setSystemUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // silent
    }
  }, []);

  // Delete a single notification from state + DB
  const deleteSystemNotif = useCallback(async (id) => {
    setSystemNotifications((prev) => {
      const notif = prev.find((n) => n._id === id);
      if (notif && !notif.is_read) {
        setSystemUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n._id !== id);
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      // silent
    }
  }, []);

  // Delete ALL notifications from state + DB
  const deleteAllSystemNotifs = useCallback(async () => {
    setSystemNotifications([]);
    setSystemUnreadCount(0);
    try {
      await api.delete('/notifications');
    } catch {
      // silent
    }
  }, []);

  // ── Fetch unread chat messages ────────────────────────────────────────────────
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
            text: item.unreadCount > 1 ? `${item.unreadCount} unread messages` : msg.text,
            unreadCount: item.unreadCount,
          });
        }
      }

      setUnreadCounts(counts);
      if (startupPopups.length) setNotifications(startupPopups.slice(0, 5));
    } catch {
      // silent
    }
  }, []);

  // ── Fetch system notifications ────────────────────────────────────────────────
  const fetchSystemNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setSystemNotifications(data.data || []);
      setSystemUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    }
  }, []);

  // ── Socket connection ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    // Load persisted data on login
    fetchUnread();
    fetchSystemNotifications();

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 15000,
      timeout: 8000,
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      if (!socketRef.current?._connectErrorLogged) {
        console.warn('[Socket] Could not connect to server:', err.message);
        if (socketRef.current) socketRef.current._connectErrorLogged = true;
      }
    });

    // On every (re)connect: re-fetch so any events missed while offline are loaded
    socket.on('connect', () => {
      if (socketRef.current) socketRef.current._connectErrorLogged = false;
      fetchUnread();
      fetchSystemNotifications();
    });

    // ── Chat message notification ─────────────────────────────────────────────
    socket.on('chat_notification', (data) => {
      const { bookingId, messageId } = data;

      setUnreadCounts((prev) => ({
        ...prev,
        [bookingId]: (prev[bookingId] || 0) + 1,
      }));

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
        const filtered = prev.filter((n) => n.bookingId !== bookingId);
        return [popup, ...filtered].slice(0, 5);
      });
    });

    // ── System notification (booking, OTP, verification, etc.) ───────────────
    socket.on('notification', (notif) => {
      // When a booking completes, also remove OTP notifications for that booking from state
      if (notif.type === 'booking_status' && notif.data?.status === 'completed' && notif.data?.bookingId) {
        setSystemNotifications((prev) =>
          prev.filter((n) => !(n.type === 'otp' && n.data?.bookingId === notif.data.bookingId))
        );
      }

      setSystemNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev].slice(0, 50);
      });
      setSystemUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchUnread, fetchSystemNotifications]);

  // ── Expose null-safe values so stale state never leaks between sessions ───────
  const isLoggedIn = Boolean(user);
  const safeUnreadCounts        = isLoggedIn ? unreadCounts        : {};
  const safeNotifications       = isLoggedIn ? notifications       : [];
  const safeSystemNotifications = isLoggedIn ? systemNotifications : [];
  const safeSystemUnreadCount   = isLoggedIn ? systemUnreadCount   : 0;
  const totalChatUnread = Object.values(safeUnreadCounts).reduce((a, b) => a + b, 0);
  const totalUnreadCount = totalChatUnread + safeSystemUnreadCount;

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef,
        // Chat
        notifications: safeNotifications,
        unreadCounts: safeUnreadCounts,
        dismissNotification,
        dismissAllNotifications,
        setActiveChatBooking,
        markLocalRead,
        fetchUnread,
        // System notifications
        systemNotifications: safeSystemNotifications,
        systemUnreadCount: safeSystemUnreadCount,
        totalUnreadCount,
        markSystemNotifRead,
        markAllSystemRead,
        deleteSystemNotif,
        deleteAllSystemNotifs,
        fetchSystemNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
