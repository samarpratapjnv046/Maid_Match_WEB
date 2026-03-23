import Offer from '../models/Offer.js';
import { AppError } from '../utils/errorHandler.js';

// ─── Customer: validate & apply coupon ───────────────────────────────────────
// POST /api/coupons/apply  { code, booking_amount }
// Looks up the coupon code from the Offer model (offers now carry coupon codes)
export const applyCoupon = async (req, res, next) => {
  try {
    const { code, booking_amount } = req.body;

    if (!code || !booking_amount) {
      return next(new AppError('Coupon code and booking_amount are required.', 400));
    }

    const offer = await Offer.findOne({ coupon_code: code.toUpperCase().trim() });
    if (!offer || !offer.coupon_code) {
      return next(new AppError('Invalid coupon code.', 400));
    }
    if (!offer.is_active) {
      return next(new AppError('This coupon is no longer active.', 400));
    }

    // Expiry check (shared with offer expiry)
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      return next(new AppError('This coupon has expired.', 400));
    }

    // No discount value configured
    if (!offer.discount_value || offer.discount_value <= 0) {
      return next(new AppError('This offer does not have a valid discount configured.', 400));
    }

    // Usage limit check
    if (offer.usage_limit !== null && offer.used_count >= offer.usage_limit) {
      return next(new AppError('This coupon has reached its usage limit.', 400));
    }

    // Minimum order check
    if (booking_amount < offer.min_order_value) {
      return next(
        new AppError(
          `This coupon requires a minimum booking amount of ₹${offer.min_order_value}.`,
          400
        )
      );
    }

    // Calculate discount
    let discountAmount;
    if (offer.discount_type === 'percentage') {
      discountAmount = Math.round((booking_amount * offer.discount_value) / 100);
      if (offer.max_discount) {
        discountAmount = Math.min(discountAmount, offer.max_discount);
      }
    } else {
      discountAmount = Math.min(offer.discount_value, booking_amount);
    }

    res.json({
      success: true,
      data: {
        code: offer.coupon_code,
        offer_title: offer.title,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        discount_amount: discountAmount,
        final_amount: booking_amount - discountAmount,
        message:
          offer.discount_type === 'percentage'
            ? `${offer.discount_value}% off applied — you save ₹${discountAmount}!`
            : `Flat ₹${discountAmount} off applied!`,
      },
    });
  } catch (err) {
    next(err);
  }
};
