import Memory from '../models/Memory.js';
import Album from '../models/Album.js';
import LoveLetter from '../models/LoveLetter.js';
import Milestone from '../models/Milestone.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Helper for socket events
const emitMemoryUpdate = (req, type, action, data) => {
  const io = req.app.get('io');
  if (io && req.user && req.user.relationshipId) {
    io.to(req.user.relationshipId.toString()).emit('memory_update', { type, action, data });
  }
};

/* ==========================================================
 * MEMORIES
 * ========================================================== */

export const getMemories = async (req, res) => {
  try {
    const { type, albumId, favorite, sort = '-date' } = req.query;
    let query = { relationshipId: req.user.relationshipId };

    if (type) query.mediaType = type;
    if (albumId) query.albumId = albumId;
    if (favorite === 'true') query.favorite = true;

    const memories = await Memory.find(query).sort(sort).populate('createdBy', 'name avatar');
    sendSuccess(res, 'Success', { memories });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const createMemory = async (req, res) => {
  try {
    const memoryData = { ...req.body, createdBy: req.user._id, relationshipId: req.user.relationshipId };
    
    // If a file was uploaded via multer, use its Cloudinary path (or fallback mock)
    if (req.file) {
      if (req.file.path) {
        memoryData.mediaUrl = req.file.path;
      } else {
        // Mock fallback if cloudinary keys aren't set
        memoryData.mediaUrl = `https://placehold.co/600x400/EEE/31343C?text=Mock+${memoryData.mediaType || 'Media'}`;
      }
    }

    const memory = await Memory.create(memoryData);
    await memory.populate('createdBy', 'name avatar');
    emitMemoryUpdate(req, 'memory', 'created', memory);
    sendSuccess(res, 'Memory created successfully', { memory }, 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const updateMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, relationshipId: req.user.relationshipId },
      req.body,
      { new: true }
    ).populate('createdBy', 'name avatar');

    if (!memory) return sendError(res, 'Memory not found', 404);
    emitMemoryUpdate(req, 'memory', 'updated', memory);
    sendSuccess(res, 'Success', { memory });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!memory) return sendError(res, 'Memory not found', 404);
    emitMemoryUpdate(req, 'memory', 'deleted', { _id: req.params.id });
    sendSuccess(res, 'Memory deleted successfully', null);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/* ==========================================================
 * ALBUMS
 * ========================================================== */

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ relationshipId: req.user.relationshipId }).sort('-createdAt');
    sendSuccess(res, 'Success', { albums });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const createAlbum = async (req, res) => {
  try {
    const albumData = { ...req.body, createdBy: req.user._id, relationshipId: req.user.relationshipId };
    const album = await Album.create(albumData);
    emitMemoryUpdate(req, 'album', 'created', album);
    sendSuccess(res, 'Album created successfully', { album }, 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!album) return sendError(res, 'Album not found', 404);
    // Remove references to this album from memories
    await Memory.updateMany({ albumId: req.params.id }, { $set: { albumId: null } });
    emitMemoryUpdate(req, 'album', 'deleted', { _id: req.params.id });
    sendSuccess(res, 'Album deleted successfully', null);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/* ==========================================================
 * LOVE LETTERS
 * ========================================================== */

export const getLoveLetters = async (req, res) => {
  try {
    // Return all shared letters, and private letters authored by the user
    const letters = await LoveLetter.find({
      relationshipId: req.user.relationshipId,
      $or: [
        { visibility: 'shared' },
        { visibility: 'private', authorId: req.user._id }
      ]
    }).sort('-createdAt').populate('authorId', 'name avatar');
    sendSuccess(res, 'Success', { letters });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const createLoveLetter = async (req, res) => {
  try {
    const letterData = { ...req.body, authorId: req.user._id, relationshipId: req.user.relationshipId };
    const letter = await LoveLetter.create(letterData);
    await letter.populate('authorId', 'name avatar');
    emitMemoryUpdate(req, 'loveletter', 'created', letter);
    sendSuccess(res, 'Love letter saved', { letter }, 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const updateLoveLetter = async (req, res) => {
  try {
    const letter = await LoveLetter.findOneAndUpdate(
      { _id: req.params.id, relationshipId: req.user.relationshipId, authorId: req.user._id }, // Only author can edit
      req.body,
      { new: true }
    ).populate('authorId', 'name avatar');

    if (!letter) return sendError(res, 'Letter not found or unauthorized', 404);
    emitMemoryUpdate(req, 'loveletter', 'updated', letter);
    sendSuccess(res, 'Success', { letter });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const deleteLoveLetter = async (req, res) => {
  try {
    const letter = await LoveLetter.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId, authorId: req.user._id });
    if (!letter) return sendError(res, 'Letter not found or unauthorized', 404);
    emitMemoryUpdate(req, 'loveletter', 'deleted', { _id: req.params.id });
    sendSuccess(res, 'Letter deleted successfully', null);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/* ==========================================================
 * MILESTONES
 * ========================================================== */

export const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ relationshipId: req.user.relationshipId }).sort('-date');
    sendSuccess(res, 'Success', { milestones });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const createMilestone = async (req, res) => {
  try {
    const milestoneData = { ...req.body, createdBy: req.user._id, relationshipId: req.user.relationshipId };
    const milestone = await Milestone.create(milestoneData);
    emitMemoryUpdate(req, 'milestone', 'created', milestone);
    sendSuccess(res, 'Milestone added', { milestone }, 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!milestone) return sendError(res, 'Milestone not found', 404);
    emitMemoryUpdate(req, 'milestone', 'deleted', { _id: req.params.id });
    sendSuccess(res, 'Milestone deleted successfully', null);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
