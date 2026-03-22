import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { X, Send, MessageCircle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';

const CHAT_ALLOWED_STATUSES = ['accepted', 'pending_payment', 'paid'];

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function ChatWindow({ bookingId, otherPartyName, onClose }) {
  const { user } = useAuth();
  const { setActiveChatBooking } = useSocket() || {};

  // Register as active → suppresses incoming popups + clears local badge.
  // The GET /chat/:bookingId already marks messages as read on the server,
  // so no separate POST /read call is needed here.
  useEffect(() => {
    setActiveChatBooking?.(bookingId);
    return () => setActiveChatBooking?.(null);
  }, [bookingId, setActiveChatBooking]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatAllowed, setChatAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history and connect socket
  useEffect(() => {
    if (!bookingId) return;

    let socket;

    async function init() {
      setLoading(true);
      try {
        const { data } = await api.get(`/chat/${bookingId}`);
        setMessages(data.data || []);
        setChatAllowed(data.chatAllowed);

        if (data.chatAllowed) {
          const token = localStorage.getItem('accessToken');
          socket = io(SERVER_URL, {
            auth: { token },
            transports: ['websocket'],
          });

          socketRef.current = socket;

          socket.emit('join_booking', { bookingId });

          socket.on('new_message', (msg) => {
            setMessages((prev) => {
              // Avoid duplicates (if REST already returned it)
              if (prev.some((m) => m._id === msg._id)) return prev;
              return [...prev, msg];
            });
          });

          socket.on('error', (err) => {
            console.error('Socket error:', err.message);
          });
        }
      } catch (err) {
        console.error('Chat init error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (socket) {
        socket.emit('leave_booking', { bookingId });
        socket.disconnect();
      }
    };
  }, [bookingId]);

 const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;

    setSending(true);
    const currentText = text.trim();
    
    // Optimistically clear the input field for a snappy UI
    setText(''); 
    inputRef.current?.focus();

    try {
      if (socketRef.current?.connected) {
        // Pass a callback function as the 3rd argument to capture the server's response
        socketRef.current.emit('send_message', { bookingId, text: currentText }, (response) => {
          if (response?.success) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === response.data._id)) return prev;
              return [...prev, response.data];
            });
          } else {
            console.error('Server rejected message:', response?.message);
            setText(currentText); // Restore text if the server rejected it
          }
        });
      } else {
        // Fallback to REST if socket is disconnected
        const { data } = await api.post(`/chat/${bookingId}`, { text: currentText });
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.data._id)) return prev;
          return [...prev, data.data];
        });
      }
    } catch (err) {
      console.error('Send error:', err);
      setText(currentText); // Restore text if an exception occurred
    } finally {
      setSending(false);
    }
  }, [text, sending, bookingId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const myId = user?._id || user?.id;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-[360px] max-w-[95vw] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1B2B4B] text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#C9A84C]" />
          <span className="font-semibold text-sm truncate max-w-[220px]">
            Chat with {otherPartyName || 'User'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !chatAllowed ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-gray-400">
            <Lock size={32} />
            <p className="text-sm font-medium">Chat is not available</p>
            <p className="text-xs">Chat is only available for active bookings and is removed after completion.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id?._id === myId || msg.sender_id?._id?.toString() === myId?.toString() || msg.sender_id === myId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-[#1B2B4B] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-[#C9A84C] mb-1 capitalize">
                      {msg.sender_role}
                    </p>
                  )}
                  <p className="break-words">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chatAllowed && !loading && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 bg-white flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B2B4B]/30 transition"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2 rounded-full bg-[#1B2B4B] text-white disabled:opacity-40 hover:bg-[#263d6b] transition-colors flex-shrink-0"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
