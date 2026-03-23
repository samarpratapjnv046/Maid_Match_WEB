import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    discount_type: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type is required'],
    },
    discount_value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1'],
    },
    min_order_value: { type: Number, default: 0, min: 0 }, // minimum booking amount to apply coupon
    max_discount: { type: Number, default: null },         // cap for percentage discounts (null = no cap)
    usage_limit: { type: Number, default: null },          // null = unlimited
    used_count: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date, default: null },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ is_active: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
