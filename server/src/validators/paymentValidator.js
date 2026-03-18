import Joi from 'joi';

export const createOrderSchema = Joi.object({
  booking_id: Joi.string().length(24).hex().required(),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  booking_id: Joi.string().length(24).hex().required(),
});
