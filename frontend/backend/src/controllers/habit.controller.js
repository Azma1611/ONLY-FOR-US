import Habit from '../models/Habit.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/habits
 */
export const getHabits = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access habits.', 400);
    }

    // Find user and partner IDs to retrieve habits from both partners
    const coupleMembers = await User.find({ relationshipId }).select('_id');
    const memberIds = coupleMembers.map(member => member._id);

    const habits = await Habit.find({ owner: { $in: memberIds } }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Habits fetched successfully.', { habits });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/habits
 */
export const createHabit = async (req, res, next) => {
  try {
    const { title, frequency } = req.body;
    if (!title) {
      return sendError(res, 'Habit title is required.', 400);
    }

    const habit = await Habit.create({
      owner: req.user._id,
      title,
      frequency: frequency || 'daily',
      streak: 0,
      completedDates: [],
    });

    logger.info(`Habit created: ${habit.title} by user ${req.user.name}`);

    // Emit live update to couple room
    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'habit_created', { habit });
    }

    return sendSuccess(res, 'Habit created successfully.', { habit }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/habits/:id
 */
export const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return sendError(res, 'Habit not found.', 404);
    }

    if (habit.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this habit.', 403);
    }

    const allowedUpdates = ['title', 'frequency'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        habit[key] = req.body[key];
      }
    }

    await habit.save();

    logger.info(`Habit settings updated: ID ${habit._id}`);

    // Emit live update to couple room
    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'habit_updated', { habit });
    }

    return sendSuccess(res, 'Habit updated successfully.', { habit });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/habits/:id/toggle
 */
export const toggleHabitDate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return sendError(res, 'Target completion date is required.', 400);
    }

    const habit = await Habit.findById(id);
    if (!habit) {
      return sendError(res, 'Habit not found.', 404);
    }

    if (habit.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to modify this habit.', 403);
    }

    // Normalize target date to midnight UTC to prevent time zone offset shifts
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existsIndex = habit.completedDates.findIndex(
      (completedDate) => new Date(completedDate).getTime() === targetDate.getTime()
    );

    if (existsIndex > -1) {
      // Date exists: toggle uncompleted (remove date)
      habit.completedDates.splice(existsIndex, 1);
    } else {
      // Date does not exist: toggle completed (append date)
      habit.completedDates.push(targetDate);
    }

    // Sort completed dates descending (most recent first)
    const sortedTimestamps = habit.completedDates
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a);

    // Calculate streak
    let streakCount = 0;
    if (sortedTimestamps.length > 0) {
      const todayMs = new Date().setUTCHours(0, 0, 0, 0);
      const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

      // Habit must be checked either today or yesterday to continue active streak
      if (sortedTimestamps[0] === todayMs || sortedTimestamps[0] === yesterdayMs) {
        streakCount = 1;
        for (let i = 0; i < sortedTimestamps.length - 1; i++) {
          const diff = sortedTimestamps[i] - sortedTimestamps[i + 1];
          if (diff === 24 * 60 * 60 * 1000) {
            // Consecutive day
            streakCount++;
          } else if (diff > 0) {
            // Break in streak days
            break;
          }
        }
      }
    }

    habit.streak = streakCount;
    await habit.save();

    logger.info(`Habit toggled: ID ${habit._id}, current streak is ${habit.streak}`);

    // Emit live update to couple room
    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'habit_updated', { habit });
    }

    return sendSuccess(res, 'Habit completion date toggled successfully.', { habit });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/habits/:id
 */
export const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return sendError(res, 'Habit not found.', 404);
    }

    if (habit.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this habit.', 403);
    }

    await Habit.deleteOne({ _id: id });

    logger.info(`Habit deleted: ID ${id}`);

    // Emit live delete alert to couple room
    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'habit_deleted', { habitId: id });
    }

    return sendSuccess(res, 'Habit deleted successfully.');
  } catch (error) {
    next(error);
  }
};
