import User from '../models/User.js';
import Session from '../models/Session.js';
import Relationship from '../models/Relationship.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * GET /api/users/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('relationshipId');
    return sendSuccess(res, 'User profile fetched successfully.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'username', 'bio', 'phone', 'theme', 'language', 'notificationSettings'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Check for username uniqueness if modified
    if (updates.username) {
      const exists = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id }
      });
      if (exists) {
        return sendError(res, 'This username is already taken.', 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.name}`);

    return sendSuccess(res, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/avatar
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No avatar file was uploaded.', 400);
    }

    // Upload stream to Cloudinary folder 'avatars'
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'avatars');
    const oldAvatar = req.user.avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }
    );

    // Asynchronously delete previous avatar to avoid blocking response
    if (oldAvatar) {
      deleteFromCloudinary(oldAvatar);
    }

    logger.info(`Avatar uploaded for user: ${user.name}`);

    return sendSuccess(res, 'Avatar updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Handle relationship updates if user belongs to an active relationship
    if (req.user.relationshipId) {
      const rel = await Relationship.findById(req.user.relationshipId);
      if (rel) {
        if (rel.partnerOne.toString() === userId.toString()) {
          if (rel.partnerTwo) {
            // Promote partnerTwo to partnerOne and set status to pending
            rel.partnerOne = rel.partnerTwo;
            rel.partnerTwo = null;
            rel.relationshipStatus = 'pending';
            await rel.save();
          } else {
            // Delete relationship if there was only one user remaining
            await Relationship.deleteOne({ _id: rel._id });
          }
        } else if (rel.partnerTwo && rel.partnerTwo.toString() === userId.toString()) {
          rel.partnerTwo = null;
          rel.relationshipStatus = 'pending';
          await rel.save();
        }
      }
    }

    // Delete user profile and session logs
    await User.deleteOne({ _id: userId });
    await Session.deleteMany({ user: userId });

    logger.info(`Account deleted: User ID ${userId}`);

    return sendSuccess(res, 'Account deleted successfully.');
  } catch (error) {
    next(error);
  }
};
