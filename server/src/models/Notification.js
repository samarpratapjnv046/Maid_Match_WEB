import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['booking_request', 'booking_status', 'otp', 'admin_verification', 'profile_status'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body:  { type: String, required: true, maxlength: 500 },
    // Flexible payload — e.g. { bookingId, status, otp }
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
