import Reminder from '../models/Reminder.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ relationshipId: req.user.relationshipId }).sort({ executeAt: 1 });
    return sendSuccess(res, reminders);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createReminder = async (req, res) => {
  try {
    const { title, description, module, executeAt, repeat } = req.body;
    const reminder = await Reminder.create({
      title,
      description,
      module,
      executeAt,
      repeat,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });
    return sendSuccess(res, reminder, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, relationshipId: req.user.relationshipId },
      req.body,
      { new: true }
    );
    if (!reminder) return sendError(res, 'Reminder not found', 404);
    return sendSuccess(res, reminder);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    return sendSuccess(res, { message: 'Deleted successfully' });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
