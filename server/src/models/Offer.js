import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: { type: String, trim: true, maxlength: 150, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    badge_text: { type: String, trim: true, maxlength: 30, default: '' }, // e.g. "20% OFF", "LIMITED"
    discount_percent: { type: Number, min: 0, max: 100, default: 0 },   // visual badge only

    // ── Coupon code (optional) ──────────────────────────────────────────────
    coupon_code:      { type: String, trim: true, uppercase: true, default: '', maxlength: 20 },
    discount_type:    { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discount_value:   { type: Number, default: 0, min: 0 },   // actual value used for calculation
    min_order_value:  { type: Number, default: 0, min: 0 },
    max_discount:     { type: Number, default: null },         // cap for % discounts
    usage_limit:      { type: Number, default: null },         // null = unlimited
    used_count:       { type: Number, default: 0 },

    gradient: {
      type: String,
      default: 'from-orange-500 to-red-500',
    },
    accent_color: { type: String, default: '#f97316' }, // hex — used for badge, countdown ring
    video_url: { type: String, default: '' },           // YouTube URL (full or embed)
    image_url: { type: String, default: '' },           // fallback background image
    cta_text: { type: String, default: 'Book Now', maxlength: 40 },
    cta_link: { type: String, default: '/workers' },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date, default: null },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

offerSchema.index({ is_active: 1, display_order: 1 });
offerSchema.index({ expires_at: 1 });
offerSchema.index({ coupon_code: 1 }, { sparse: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
