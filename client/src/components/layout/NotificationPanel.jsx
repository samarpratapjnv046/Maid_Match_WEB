import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, CheckCheck, Briefcase, Key, ShieldCheck, X, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_CONFIG = {
  booking_request:    { icon: Briefcase,     color: 'text-blue-600',   bg: 'bg-blue-50' },
  booking_status:     { icon: CheckCheck,    color: 'text-green-600',  bg: 'bg-green-50' },
  otp:                { icon: Key,           color: 'text-amber-600',  bg: 'bg-amber-50' },
  admin_verification: { icon: ShieldCheck,   color: 'text-purple-600', bg: 'bg-purple-50' },
  profile_status:     { icon: Briefcase,     color: 'text-gray-600',   bg: 'bg-gray-50' },
  message:            { icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
};

// ── Navigation helper ─────────────────────────────────────────────────────────

function useNotifNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return useCallback((notif) => {
    const { type, data } = notif;
    const bookingId = data?.bookingId;

    if (type === 'message' && bookingId) {
      return user?.role === 'worker'
        ? navigate(`/worker/bookings`)
        : navigate(`/bookings/${bookingId}`);
    }
    if (type === 'booking_request') {
      return navigate('/worker/bookings');
    }
    if ((type === 'booking_status' || type === 'otp') && bookingId) {
      return user?.role === 'worker'
        ? navigate('/worker/bookings')
        : navigate(`/bookings/${bookingId}`);
    }
    if (type === 'admin_verification') {
      return navigate('/worker/profile');
    }
    if (type === 'profile_status') {
      return navigate('/worker/dashboard');
    }
  }, [navigate, user]);
}

// ── Chat unread item ──────────────────────────────────────────────────────────

function ChatNotifItem({ bookingId, count, navigate }) {
  const cfg = TYPE_CONFIG.message;
  const Icon = cfg.icon;
  return (
    <div className="w-full flex items-start gap-3 px-4 py-3 bg-primary-50/30 hover:bg-primary-50/60 transition-colors">
      <button
        onClick={() => navigate({ type: 'message', data: { bookingId } })}
        className="flex items-start gap-3 flex-1 text-left min-w-0"
      >
        <span className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
          <Icon size={15} className={cfg.color} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">New chat message</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {count} unread message{count > 1 ? 's' : ''} in booking
          </p>
        </div>
        <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center px-1">
          {count}
        </span>
      </button>
    </div>
  );
}

// ── Single system notification item ──────────────────────────────────────────

function NotifItem({ notif, onRead, onDelete, navigate }) {
  const isOtp = notif.type === 'otp';
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.booking_status;
  const Icon = cfg.icon;

  const handleClick = () => {
    // OTP: navigate only — no deletion on read (stays until booking completes)
    if (!isOtp && !notif.is_read) onRead(notif._id);
    navigate(notif);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notif._id);
  };

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 transition-colors ${
        isOtp
          ? 'bg-amber-50/60 border-l-2 border-amber-400 hover:bg-amber-50'
          : !notif.is_read
          ? 'bg-blue-50/40 hover:bg-blue-50/70'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Clickable content area */}
      <button onClick={handleClick} className="flex items-start gap-3 flex-1 text-left min-w-0">
        <span className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
          <Icon size={15} className={cfg.color} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm truncate ${notif.is_read && !isOtp ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'}`}>
              {notif.title}
            </p>
            {isOtp && (
              <span className="flex-shrink-0 text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                Pinned
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
          <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
        </div>
        {!notif.is_read && !isOtp && (
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2 mr-1" />
        )}
      </button>

      {/* Delete button — always visible on hover, always visible on mobile */}
      <button
        onClick={handleDelete}
        title="Delete notification"
        className="flex-shrink-0 mt-1 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete notification"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigateTo = useNotifNavigate();

  const {
    totalUnreadCount,
    systemNotifications,
    unreadCounts,
    markSystemNotifRead,
    markAllSystemRead,
    deleteSystemNotif,
    deleteAllSystemNotifs,
  } = useSocket();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Chat unread entries to show in panel
  const chatEntries = Object.entries(unreadCounts).filter(([, count]) => count > 0);
  const hasAny = chatEntries.length > 0 || systemNotifications.length > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-3">
              {totalUnreadCount > 0 && (
                <button
                  onClick={markAllSystemRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              {systemNotifications.length > 0 && (
                <button
                  onClick={deleteAllSystemNotifs}
                  title="Delete all notifications"
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  <Trash2 size={12} />
                  Delete all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {!hasAny && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}

            {/* Chat unread items */}
            {chatEntries.map(([bookingId, count]) => (
              <ChatNotifItem
                key={`chat-${bookingId}`}
                bookingId={bookingId}
                count={count}
                navigate={navigateTo}
              />
            ))}

            {/* System notifications */}
            {systemNotifications.map((notif) => (
              <NotifItem
                key={notif._id}
                notif={notif}
                onRead={markSystemNotifRead}
                onDelete={deleteSystemNotif}
                navigate={navigateTo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
