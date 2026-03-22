import mongoose from 'mongoose';

const registerOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  otp_hash: { type: String, required: true },
  expires_at: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  locked_until: { type: Date },
});

// Auto-delete documents 10 minutes after expiry
registerOTPSchema.index({ expires_at: 1 }, { expireAfterSeconds: 600 });

const RegisterOTP = mongoose.model('RegisterOTP', registerOTPSchema);
export default RegisterOTP;
