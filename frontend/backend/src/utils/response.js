/**
 * Sends a standardized success JSON response.
 */
export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error JSON response.
 */
export const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
