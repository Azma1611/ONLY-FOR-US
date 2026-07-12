import { verifyAccessToken } from '../services/jwt.service.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

/**
 * Route protection middleware. Validates access token and attaches the authenticated
 * user to the request object.
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Bearer authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized, access token missing.', 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    
    // Find user by decoded ID, excluding the hashed password field
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'Not authorized, user account not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Returns exact token-expired flags to trigger axios token rotations on the client
      return res.status(401).json({
        success: false,
        message: 'Access token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return sendError(res, 'Not authorized, invalid access token.', 401);
  }
};
