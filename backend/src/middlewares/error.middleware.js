import logger from '../utils/logger.js';

/**
 * Global centralized error handler. Captures all unhandled exceptions,
 * logs them, and returns a standardized JSON error message.
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandle Exception on route [${req.method}] ${req.path}: ${err.message}`, err);

  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal server error occurred.';

  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default errorHandler;
