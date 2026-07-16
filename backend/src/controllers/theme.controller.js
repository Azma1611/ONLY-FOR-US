import RelationshipTheme from '../models/RelationshipTheme.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/** @type {readonly string[]} Valid mood theme values */
const VALID_THEMES = ['love', 'normal', 'sad', 'angry'];

/**
 * GET /api/theme
 * Returns the current relationship mood theme.
 * Creates a default 'normal' entry if none exists yet.
 */
export const getTheme = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.relationshipId) {
      return sendError(res, 'You must be in an active relationship to access mood themes.', 403);
    }

    // Find existing theme or create default
    let themeDoc = await RelationshipTheme.findOne({ relationshipId: user.relationshipId })
      .populate('updatedBy', 'name avatar');

    if (!themeDoc) {
      themeDoc = await RelationshipTheme.create({
        relationshipId: user.relationshipId,
        theme: 'normal',
        updatedBy: user._id,
        updatedAt: new Date(),
      });
      themeDoc = await RelationshipTheme.findById(themeDoc._id)
        .populate('updatedBy', 'name avatar');
    }

    return sendSuccess(res, 'Mood theme fetched successfully.', { theme: themeDoc });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/theme
 * Updates the shared mood theme for the relationship.
 * Emits a Socket.IO event so the partner's app updates instantly.
 */
export const updateTheme = async (req, res, next) => {
  try {
    const user = req.user;
    const { theme } = req.body;

    if (!user.relationshipId) {
      return sendError(res, 'You must be in an active relationship to change mood themes.', 403);
    }

    if (!theme || !VALID_THEMES.includes(theme)) {
      return sendError(
        res,
        `Invalid theme value. Must be one of: ${VALID_THEMES.join(', ')}`,
        400
      );
    }

    // Upsert the theme document
    const themeDoc = await RelationshipTheme.findOneAndUpdate(
      { relationshipId: user.relationshipId },
      {
        theme,
        updatedBy: user._id,
        updatedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('updatedBy', 'name avatar');

    logger.info(`Mood theme updated to "${theme}" by ${user.name} (Relationship: ${user.relationshipId})`);

    // Broadcast to both partners in the relationship room
    emitToCouple(user.relationshipId, 'theme_changed', {
      theme: themeDoc.theme,
      updatedBy: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
      updatedAt: themeDoc.updatedAt,
    });

    return sendSuccess(res, 'Mood theme updated and synced with your partner.', { theme: themeDoc });
  } catch (error) {
    next(error);
  }
};
