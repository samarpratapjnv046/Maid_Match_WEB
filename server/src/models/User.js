import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    role: {
      type: String,
      enum: ['customer', 'worker', 'admin'],
      default: 'customer',
    },
    profilePhoto: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    is_active: { type: Boolean, default: true },
    is_banned: { type: Boolean, default: false },
    ban_reason: { type: String, default: '' },
    refreshToken: { type: String, select: false },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ 'address.coordinates': '2dsphere' });

userSchema.pre('save', async function () {
  // 1. If password is not modified, just exit the function (no 'next' needed)
  if (!this.isModified('password')) return;

  // 2. Hash the password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // 3. Update the passwordChangedAt timestamp if it's an existing user
  if (!this.isNew) {
    // Pro-tip: Subtract 1 second to ensure the token generated *after* saving 
    // isn't accidentally marked as created *before* the password change.
    this.passwordChangedAt = Date.now() - 1000; 
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTime;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
