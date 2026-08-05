/**
 * Custom error class used throughout controllers to throw errors with
 * a specific HTTP status code. Caught by the global errorHandler middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
