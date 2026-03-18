import { AppError } from '../utils/errorHandler.js';

/**
 * Middleware factory that validates req.body against a Joi schema.
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new AppError(message, 422));
  }

  req.body = value;
  next();
};
