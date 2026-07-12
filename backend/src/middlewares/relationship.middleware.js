import { sendError } from '../utils/response.js';

/**
 * Middleware to verify that the user is currently connected to a partner in a relationship.
 * Prevents single users onboarding or disconnected users from accessing chat APIs.
 */
export const verifyRelationship = (req, res, next) => {
  if (!req.user || !req.user.relationshipId || !req.user.partnerId || !req.user.isConnected) {
    return sendError(
      res,
      'Access denied. You must be actively paired in a relationship with a partner to access the chat system.',
      403
    );
  }
  next();
};
