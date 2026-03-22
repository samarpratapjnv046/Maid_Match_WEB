import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

// Single notification toast
function NotificationToast({ notification, onDismiss, onOpen }) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleOpen = () => {
    setVisible(false);
    setTimeout(onOpen, 300);
  };

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg p-3.5 cursor-pointer transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onClick={handleOpen}
    >
      {/* Avatar / icon */}
      <div className="flex-shrink-0">
        {notification.senderPhoto ? (
          <img
            src={notification.senderPhoto}
            alt={notification.senderName}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#1B2B4B]/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {notification.senderName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <MessageCircle size={12} className="text-[#C9A84C] flex-shrink-0" />
          <p className="text-xs font-semibold text-[#1B2B4B] truncate">
            {notification.senderName}
            <span className="font-normal text-gray-400 ml-1 capitalize">({notification.senderRole})</span>
          </p>
        </div>
        <p className="text-sm text-gray-700 truncate leading-snug">{notification.text}</p>
        <p className="text-[10px] text-gray-400 mt-1">Tap to open chat</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Container that renders all active notifications
export default function MessageNotifications({ onOpenChat }) {
  const { notifications, dismissNotification } = useSocket();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <NotificationToast
            notification={n}
            onDismiss={() => dismissNotification(n.id)}
            onOpen={() => {
              dismissNotification(n.id);
              if (onOpenChat) onOpenChat(n);
            }}
          />
        </div>
      ))}
    </div>
  );
}
