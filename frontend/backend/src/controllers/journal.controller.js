import Journal from '../models/Journal.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * GET /api/journal
 */
export const getJournals = async (req, res, next) => {
  try {
    // Journals are strictly private to the owner
    const journals = await Journal.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Journal entries fetched successfully.', { journals });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/journal
 */
export const createJournal = async (req, res, next) => {
  try {
    const { title, content, mood } = req.body;
    if (!title || !content) {
      return sendError(res, 'Journal title and content fields are required.', 400);
    }

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Process multi-file image uploads to Cloudinary journals folder
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'journals');
        imageUrls.push(url);
      }
    }

    const journal = await Journal.create({
      owner: req.user._id,
      title,
      content,
      mood: mood || 'neutral',
      images: imageUrls,
    });

    logger.info(`Journal entry logged: "${journal.title}" by user ${req.user.name}`);

    return sendSuccess(res, 'Journal entry logged successfully.', { journal }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/journal/:id
 */
export const updateJournal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 'Journal entry not found.', 404);
    }

    if (journal.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this journal entry.', 403);
    }

    const allowedUpdates = ['title', 'content', 'mood'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        journal[key] = req.body[key];
      }
    }

    // Process new image uploads if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'journals');
        journal.images.push(url);
      }
    }

    await journal.save();

    logger.info(`Journal entry updated: ID ${journal._id}`);

    return sendSuccess(res, 'Journal entry updated successfully.', { journal });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/journal/:id
 */
export const deleteJournal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 'Journal entry not found.', 404);
    }

    if (journal.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this journal entry.', 403);
    }

    await Journal.deleteOne({ _id: id });

    logger.info(`Journal entry deleted: ID ${id}`);

    return sendSuccess(res, 'Journal entry deleted successfully.');
  } catch (error) {
    next(error);
  }
};
