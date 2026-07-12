import Goal from '../models/Goal.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/goals
 */
export const getGoals = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access goals.', 400);
    }

    const goals = await Goal.find({ relationshipId }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Goals fetched successfully.', { goals });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/goals
 */
export const createGoal = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to create goals.', 400);
    }

    const { title, description, deadline } = req.body;
    if (!title) {
      return sendError(res, 'Goal title is required.', 400);
    }

    const goal = await Goal.create({
      relationshipId,
      owner: req.user._id,
      title,
      description: description || '',
      deadline: deadline || null,
    });

    logger.info(`Goal created: ${goal.title} by user ${req.user.name}`);

    // Broadcast update to couple room
    emitToCouple(relationshipId, 'goal_created', { goal });

    return sendSuccess(res, 'Goal created successfully.', { goal }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/goals/:id
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return sendError(res, 'Goal not found.', 404);
    }

    if (goal.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to update this goal.', 403);
    }

    const allowedUpdates = ['title', 'description', 'deadline', 'progress', 'completed'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key];
        
        // Auto-complete goal if progress reaches 100%
        if (key === 'progress' && req.body[key] === 100) {
          goal.completed = true;
        }
      }
    }

    await goal.save();

    logger.info(`Goal updated: ID ${goal._id}`);

    // Broadcast update to couple room
    emitToCouple(req.user.relationshipId, 'goal_updated', { goal });

    return sendSuccess(res, 'Goal updated successfully.', { goal });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/goals/:id
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return sendError(res, 'Goal not found.', 404);
    }

    if (goal.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to delete this goal.', 403);
    }

    await Goal.deleteOne({ _id: id });

    logger.info(`Goal deleted: ID ${id}`);

    // Broadcast delete event to couple room
    emitToCouple(req.user.relationshipId, 'goal_deleted', { goalId: id });

    return sendSuccess(res, 'Goal deleted successfully.');
  } catch (error) {
    next(error);
  }
};
