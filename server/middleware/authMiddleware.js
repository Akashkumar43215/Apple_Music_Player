import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

/**
 * Verifies the Bearer token on protected routes, attaches the authenticated
 * user to req.user (minus the password), and calls next(). Any failure
 * throws — caught by the global errorHandler, no res.json() calls in here.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Use after `protect`.
 * Example: router.delete('/:id', protect, authorize('admin'), deleteHandler)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
};
