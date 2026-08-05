import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after express-validator's check() chains on a route. Collects any
 * validation failures into a single readable message and throws a 400.
 * Usage: router.post('/signup', signupValidation, validate, signup)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    throw new ApiError(400, message);
  }
  next();
};

export default validate;
