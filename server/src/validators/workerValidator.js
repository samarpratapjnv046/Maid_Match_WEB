import Joi from 'joi';

const SERVICE_TYPES = [
  'house_cleaning', 'deep_cleaning', 'cooking', 'babysitting',
  'elder_care', 'laundry', 'gardening', 'driver', 'security_guard',
];

export const workerProfileSchema = Joi.object({
  gender: Joi.string().valid('male', 'female', 'other').required(),
  bio: Joi.string().max(500).allow('').optional(),
  services: Joi.array().items(Joi.string().valid(...SERVICE_TYPES)).min(1).required(),
  pricing: Joi.object({
    hourly: Joi.number().min(0).default(0),
    daily: Joi.number().min(0).default(0),
    monthly: Joi.number().min(0).default(0),
  }).required(),
  experience_years: Joi.number().min(0).max(50).default(0),
  languages: Joi.array().items(Joi.string()).optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'Pincode must be 6 digits.',
    }),
    coordinates: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    }).optional(),
  }).required(),
});

export const workerUpdateSchema = Joi.object({
  bio: Joi.string().max(500).allow('').optional(),
  services: Joi.array().items(Joi.string().valid(...SERVICE_TYPES)).min(1).optional(),
  pricing: Joi.object({
    hourly: Joi.number().min(0).optional(),
    daily: Joi.number().min(0).optional(),
    monthly: Joi.number().min(0).optional(),
  }).optional(),
  experience_years: Joi.number().min(0).max(50).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  is_available: Joi.boolean().optional(),
  location: Joi.object({
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  }).optional(),
});
