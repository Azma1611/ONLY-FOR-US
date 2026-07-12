import Task from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

export const getTasks = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access tasks.', 400);
    }

    const tasks = await Task.find({ relationshipId, archived: false }).sort({ dueDate: 1, createdAt: -1 });
    return sendSuccess(res, 'Tasks fetched successfully.', { tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { title, description, assignedTo, dueDate, priority, listName, checklist } = req.body;

    if (!title) {
      return sendError(res, 'Task title is required.', 400);
    }

    // Compute progress
    let progress = 0;
    if (checklist && checklist.length > 0) {
      const completedCount = checklist.filter(item => item.completed).length;
      progress = Math.round((completedCount / checklist.length) * 100);
    }

    const task = await Task.create({
      relationshipId,
      createdBy: req.user._id,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      listName: listName || 'Personal',
      checklist: checklist || [],
      progress,
      completed: false,
    });

    emitToCouple(relationshipId, 'task_created', { task });
    return sendSuccess(res, 'Task created successfully.', { task }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    if (task.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    const allowedUpdates = [
      'title', 'description', 'assignedTo', 'dueDate', 'priority', 
      'listName', 'checklist', 'completed', 'archived'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    }

    // Recompute progress
    if (task.checklist && task.checklist.length > 0) {
      const completedCount = task.checklist.filter(item => item.completed).length;
      task.progress = Math.round((completedCount / task.checklist.length) * 100);
    } else {
      task.progress = task.completed ? 100 : 0;
    }

    await task.save();

    emitToCouple(req.user.relationshipId, 'task_updated', { task });
    return sendSuccess(res, 'Task updated successfully.', { task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    if (task.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await Task.deleteOne({ _id: id });

    emitToCouple(req.user.relationshipId, 'task_deleted', { taskId: id });
    return sendSuccess(res, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};
