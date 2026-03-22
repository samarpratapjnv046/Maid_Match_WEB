import mongoose from 'mongoose';

// Tracks per-user, per-booking "last read" time.
// Unread count = messages created AFTER last_read_at by the other party.
const chatReadSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  last_read_at: {
    type: Date,
    default: () => new Date(0), // epoch → everything starts as unread
  },
});

chatReadSchema.index({ user_id: 1, booking_id: 1 }, { unique: true });

const ChatRead = mongoose.model('ChatRead', chatReadSchema);
export default ChatRead;
