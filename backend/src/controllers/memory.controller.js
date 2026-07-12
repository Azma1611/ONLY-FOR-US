import Memory from '../models/Memory.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/memories
 */
export const getMemories = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access memories.', 400);
    }

    const memories = await Memory.find({ relationshipId }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Memories fetched successfully.', { memories });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/memories
 */
export const createMemory = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to log memories.', 400);
    }

    const { title, description, location } = req.body;
    if (!title) {
      return sendError(res, 'Memory title field is required.', 400);
    }

    const photos = [];
    const videos = [];

    // Extract multi-field attachments if uploaded via Multer
    if (req.files) {
      if (req.files.photos) {
        for (const file of req.files.photos) {
          const url = await uploadToCloudinary(file.buffer, 'memories');
          photos.push(url);
        }
      }
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const url = await uploadToCloudinary(file.buffer, 'memories');
          videos.push(url);
        }
      }
    }

    const memory = await Memory.create({
      relationshipId,
      title,
      description: description || '',
      photos,
      videos,
      location: location || '',
      createdBy: req.user._id,
    });

    logger.info(`Memory logged: "${memory.title}" in relationship space ${relationshipId}`);

    // Emit live dashboard socket update
    emitToCouple(relationshipId, 'memory_created', { memory });

    return sendSuccess(res, 'Memory created successfully.', { memory }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/memories/:id
 */
export const updateMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const memory = await Memory.findById(id);

    if (!memory) {
      return sendError(res, 'Memory not found.', 404);
    }

    if (memory.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to edit this memory.', 403);
    }

    const allowedUpdates = ['title', 'description', 'location'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        memory[key] = req.body[key];
      }
    }

    // Upload new photos or videos to the existing array if provided
    if (req.files) {
      if (req.files.photos) {
        for (const file of req.files.photos) {
          const url = await uploadToCloudinary(file.buffer, 'memories');
          memory.photos.push(url);
        }
      }
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const url = await uploadToCloudinary(file.buffer, 'memories');
          memory.videos.push(url);
        }
      }
    }

    await memory.save();

    logger.info(`Memory updated: ID ${memory._id}`);

    // Emit live socket update
    emitToCouple(req.user.relationshipId, 'memory_updated', { memory });

    return sendSuccess(res, 'Memory updated successfully.', { memory });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/memories/:id
 */
export const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const memory = await Memory.findById(id);

    if (!memory) {
      return sendError(res, 'Memory not found.', 404);
    }

    if (memory.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to delete this memory.', 403);
    }

    await Memory.deleteOne({ _id: id });

    logger.info(`Memory deleted: ID ${id}`);

    // Emit live socket deletion alert
    emitToCouple(req.user.relationshipId, 'memory_deleted', { memoryId: id });

    return sendSuccess(res, 'Memory deleted successfully.');
  } catch (error) {
    next(error);
  }
};
