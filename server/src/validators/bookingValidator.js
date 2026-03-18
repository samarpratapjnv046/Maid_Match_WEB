import Joi from 'joi';

export const createBookingSchema = Joi.object({
  worker_id: Joi.string().length(24).hex().required(),
  service_type: Joi.string().required(),
  duration_type: Joi.string().valid('hourly', 'daily', 'monthly').required(),
  start_time: Joi.date().iso().greater('now').required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  address: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
  }).required(),
  special_instructions: Joi.string().max(500).allow('').optional(),
});

export const bookingActionSchema = Joi.object({
  action: Joi.string().valid('accept', 'reject').required(),
  rejection_reason: Joi.string().max(500).when('action', {
    is: 'reject',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const otpVerifySchema = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP must be exactly 6 digits.',
  }),
});

export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('').optional(),
});
