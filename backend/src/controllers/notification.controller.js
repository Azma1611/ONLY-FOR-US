import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Notifications fetched successfully.', { notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return sendError(res, 'Notification not found.', 404);
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this notification.', 403);
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    return sendSuccess(res, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return sendError(res, 'Notification not found.', 404);
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this notification.', 403);
    }

    await Notification.deleteOne({ _id: id });
    return sendSuccess(res, 'Notification deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications
 */
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return sendError(res, 'Title and message fields are required.', 400);
    }

    const notification = await Notification.create({
      user: req.user._id,
      title,
      message,
      type: type || 'general',
      read: false,
    });

    return sendSuccess(res, 'Notification created successfully.', { notification }, 201);
  } catch (error) {
    next(error);
  }
};

