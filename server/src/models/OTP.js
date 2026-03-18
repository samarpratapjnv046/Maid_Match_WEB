import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    otp_hash: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    is_used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    locked_until: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// otpSchema.index({ booking_id: 1 });
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index - auto delete expired OTPs

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
