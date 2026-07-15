import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ relationshipId: req.user.relationshipId })
      .sort({ createdAt: -1 })
      .limit(50);
    return sendSuccess(res, notifications);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, relationshipId: req.user.relationshipId },
      { read: true },
      { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, notification);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { relationshipId: req.user.relationshipId, read: false },
      { read: true }
    );
    return sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, relationshipId: req.user.relationshipId });
    return sendSuccess(res, { message: 'Deleted successfully' });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    
    // UPSERT subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user: req.user._id,
        userAgent: req.headers['user-agent']
      },
      { upsert: true, new: true }
    );
    
    return sendSuccess(res, { message: 'Subscribed to push notifications' });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
