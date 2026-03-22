import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import ChatRead from '../models/ChatRead.js';
import { AppError } from '../utils/errorHandler.js';

const CHAT_ALLOWED_STATUSES = ['accepted', 'pending_payment', 'paid'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function verifyBookingAccess(bookingId, userId) {
  const booking = await Booking.findById(bookingId).populate('worker_id', 'user_id');
  if (!booking) throw new AppError('Booking not found.', 404);

  const workerUserId = booking.worker_id?.user_id?.toString();
  const customerUserId = booking.user_id?.toString();
  const requesterId = userId.toString();

  if (requesterId !== customerUserId && requesterId !== workerUserId) {
    throw new AppError('You are not part of this booking.', 403);
  }

  return { booking, isWorker: requesterId === workerUserId };
}

async function upsertLastRead(userId, bookingId) {
  await ChatRead.findOneAndUpdate(
    { user_id: userId, booking_id: bookingId },
    { last_read_at: new Date() },
    { upsert: true }
  );
}

// ─── GET /api/chat/:bookingId ─────────────────────────────────────────────────
// Fetch message history AND mark this chat as read for the requester.
export const getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { booking } = await verifyBookingAccess(bookingId, req.user._id);

    const messages = await Message.find({ booking_id: bookingId })
      .populate('sender_id', 'name profilePhoto')
      .sort({ createdAt: 1 })
      .lean();

    // Opening the chat = reading everything
    await upsertLastRead(req.user._id, bookingId);

    res.json({
      success: true,
      chatAllowed: CHAT_ALLOWED_STATUSES.includes(booking.status),
      bookingStatus: booking.status,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/chat/:bookingId ────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return next(new AppError('Message text is required.', 400));
    }

    const { booking, isWorker } = await verifyBookingAccess(bookingId, req.user._id);

    if (!CHAT_ALLOWED_STATUSES.includes(booking.status)) {
      return next(new AppError('Chat is not available for this booking status.', 403));
    }

    const message = await Message.create({
      booking_id: bookingId,
      sender_id: req.user._id,
      sender_role: isWorker ? 'worker' : 'customer',
      text: text.trim(),
    });

    const populated = await message.populate('sender_id', 'name profilePhoto');

    // Sender has read their own message
    await upsertLastRead(req.user._id, bookingId);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/chat/:bookingId/read ──────────────────────────────────────────
// Explicit mark-as-read (called when chat window opens).
export const markBookingRead = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    await verifyBookingAccess(bookingId, req.user._id);
    await upsertLastRead(req.user._id, bookingId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/unread ─────────────────────────────────────────────────────
// Returns per-booking unread counts + latest message preview for startup popups.
export const getUnreadCounts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // All active bookings where the user is a participant (customer or worker)
    const workerProfile = await Worker.findOne({ user_id: userId }).lean();
    const orConditions = [{ user_id: userId }];
    if (workerProfile) orConditions.push({ worker_id: workerProfile._id });

    const activeBookings = await Booking.find({
      $or: orConditions,
      status: { $in: CHAT_ALLOWED_STATUSES },
    })
      .select('_id')
      .lean();

    if (!activeBookings.length) {
      return res.json({ success: true, data: [] });
    }

    const bookingIds = activeBookings.map((b) => b._id);

    // Load last-read timestamps
    const readRecords = await ChatRead.find({
      user_id: userId,
      booking_id: { $in: bookingIds },
    }).lean();

    const readMap = {};
    for (const r of readRecords) {
      readMap[r.booking_id.toString()] = r.last_read_at;
    }

    const result = [];
    for (const { _id } of activeBookings) {
      const bid = _id.toString();
      const lastRead = readMap[bid] || new Date(0);

      const unreadCount = await Message.countDocuments({
        booking_id: _id,
        sender_id: { $ne: userId },
        createdAt: { $gt: lastRead },
      });

      if (unreadCount > 0) {
        const latest = await Message.findOne({
          booking_id: _id,
          sender_id: { $ne: userId },
          createdAt: { $gt: lastRead },
        })
          .sort({ createdAt: -1 })
          .populate('sender_id', 'name profilePhoto')
          .lean();

        result.push({ bookingId: bid, unreadCount, latestMessage: latest });
      }
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
