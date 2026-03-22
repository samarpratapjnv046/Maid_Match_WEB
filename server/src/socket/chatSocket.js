import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Message from '../models/Message.js';
import ChatRead from '../models/ChatRead.js';
import logger from '../utils/logger.js';

const CHAT_ALLOWED_STATUSES = ['accepted', 'pending_payment', 'paid'];

async function verifySocketUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id).select('name profilePhoto is_banned');
  if (!user || user.is_banned) throw new Error('Unauthorized');
  user.role = decoded.role;
  return user;
}

async function verifyBookingAccess(bookingId, userId) {
  const booking = await Booking.findById(bookingId).populate('worker_id', 'user_id');
  if (!booking) throw new Error('Booking not found');

  const workerUserId = booking.worker_id?.user_id?.toString();
  const customerUserId = booking.user_id?.toString();
  const requesterId = userId.toString();

  if (requesterId !== customerUserId && requesterId !== workerUserId) {
    throw new Error('Not a participant of this booking');
  }

  const isWorker = requesterId === workerUserId;
  const otherUserId = isWorker ? customerUserId : workerUserId;

  return { booking, isWorker, otherUserId };
}

export function initChatSocket(io) {
  io.on('connection', async (socket) => {
    // Authenticate on connection
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect(true);
      return;
    }

    let currentUser;
    try {
      currentUser = await verifySocketUser(token);
      socket.userId = currentUser._id.toString();
      // Each user joins their own personal room for receiving notifications
      socket.join(`user:${socket.userId}`);
    } catch {
      socket.disconnect(true);
      return;
    }

    // Join a booking's chat room
    socket.on('join_booking', async ({ bookingId }) => {
      try {
        const { booking } = await verifyBookingAccess(bookingId, currentUser._id);
        if (!CHAT_ALLOWED_STATUSES.includes(booking.status)) {
          socket.emit('error', { message: 'Chat not available for this booking.' });
          return;
        }
        socket.join(`booking:${bookingId}`);
        socket.emit('joined', { bookingId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Send a message via socket
    socket.on('send_message', async ({ bookingId, text }, callback) => {
      try {
        if (!text?.trim()) return;

        const { booking, isWorker, otherUserId } = await verifyBookingAccess(bookingId, currentUser._id);

        if (!CHAT_ALLOWED_STATUSES.includes(booking.status)) {
          if (typeof callback === 'function') callback({ success: false, message: 'Chat is no longer available for this booking.' });
          return;
        }

        const message = await Message.create({
          booking_id: bookingId,
          sender_id: currentUser._id,
          sender_role: isWorker ? 'worker' : 'customer',
          text: text.trim(),
        });

        const populated = await message.populate('sender_id', 'name profilePhoto');

        // Broadcast to everyone else in the room EXCEPT the sender
        socket.to(`booking:${bookingId}`).emit('new_message', populated);

        // Acknowledge back to the sender with the saved message
        if (typeof callback === 'function') {
          callback({ success: true, data: populated });
        }

        // Sender has read their own message — update last_read_at
        await ChatRead.findOneAndUpdate(
          { user_id: currentUser._id, booking_id: bookingId },
          { last_read_at: new Date() },
          { upsert: true }
        );

        // Send a notification to the other participant's personal room
        if (otherUserId) {
          io.to(`user:${otherUserId}`).emit('chat_notification', {
            bookingId,
            senderName: currentUser.name,
            senderRole: isWorker ? 'worker' : 'customer',
            senderPhoto: currentUser.profilePhoto?.url || null,
            text: text.trim(),
            messageId: populated._id,
          });
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, message: err.message });
        logger.error('Socket send_message error:', err);
      }
    });

    socket.on('leave_booking', ({ bookingId }) => {
      socket.leave(`booking:${bookingId}`);
    });

    socket.on('disconnect', () => {
      // cleanup handled by socket.io
    });
  });
}