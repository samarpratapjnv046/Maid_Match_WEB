import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender_role: {
      type: String,
      enum: ['customer', 'worker'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ booking_id: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
