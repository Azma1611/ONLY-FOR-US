import Reminder from '../models/Reminder.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getReminders = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access reminders.', 400);
    }

    // Find active reminders for this user that are due
    const reminders = await Reminder.find({ 
      relationshipId, 
      userId: req.user._id,
      isSent: false,
      remindAt: { $lte: new Date() }
    }).sort({ remindAt: 1 });

    return sendSuccess(res, 'Reminders fetched successfully.', { reminders });
  } catch (error) {
    next(error);
  }
};

export const dismissReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return sendError(res, 'Reminder not found.', 404);
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    reminder.isSent = true;
    await reminder.save();

    return sendSuccess(res, 'Reminder dismissed successfully.', { reminder });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return sendError(res, 'Reminder not found.', 404);
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await Reminder.deleteOne({ _id: id });
    return sendSuccess(res, 'Reminder deleted successfully.');
  } catch (error) {
    next(error);
  }
};
