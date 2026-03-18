import mongoose from 'mongoose';

const SERVICE_TYPES = [
  'house_cleaning',
  'deep_cleaning',
  'cooking',
  'babysitting',
  'elder_care',
  'laundry',
  'gardening',
  'driver',
  'security_guard',
];

const workerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    services: [
      {
        type: String,
        enum: SERVICE_TYPES,
        required: true,
      },
    ],
    pricing: {
      hourly: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    experience_years: { type: Number, default: 0, min: 0, max: 50 },
    languages: [{ type: String }],
    location: {
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      pincode: { type: String, required: [true, 'Pincode is required'] },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    // Aadhaar - stored securely, excluded in all public queries via .select('-aadhaar')
    aadhaar: {
      url: { type: String },
      public_id: { type: String },
      verified: { type: Boolean, default: false },
    },
    is_verified: { type: Boolean, default: false },
    is_available: { type: Boolean, default: true },
    verification_status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    rejection_reason: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    total_reviews: { type: Number, default: 0 },
    total_bookings: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },
    // OTP brute-force protection
    otp_attempts: { type: Number, default: 0 },
    otp_locked_until: { type: Date },
  },
  { timestamps: true }
);

workerSchema.index({ 'location.coordinates': '2dsphere' });
workerSchema.index({ services: 1 });
workerSchema.index({ 'location.city': 1 });
workerSchema.index({ rating: -1 });
workerSchema.index({ is_verified: 1, is_available: 1 });

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;
