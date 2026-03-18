import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password: Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase, lowercase, digit and special character.',
    }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number.',
  }),
  role: Joi.string().valid('customer', 'worker').default('customer'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional(), // also read from cookie
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match.',
  }),
});
