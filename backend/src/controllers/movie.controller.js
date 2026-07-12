import MoviePlan from '../models/MoviePlan.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';

export const getMoviePlans = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access movie plans.', 400);
    }

    const plans = await MoviePlan.find({ relationshipId }).sort({ watched: 1, createdAt: -1 });
    return sendSuccess(res, 'Movie plans fetched successfully.', { plans });
  } catch (error) {
    next(error);
  }
};

export const createMoviePlan = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { movieName, streamingPlatform, date, watched, rating, review, wishlist } = req.body;

    if (!movieName) {
      return sendError(res, 'Movie name is required.', 400);
    }

    const plan = await MoviePlan.create({
      relationshipId,
      createdBy: req.user._id,
      movieName,
      streamingPlatform: streamingPlatform || '',
      date: date || null,
      watched: !!watched,
      rating: Number(rating) || 0,
      review: review || '',
      wishlist: wishlist !== undefined ? !!wishlist : true,
    });

    emitToCouple(relationshipId, 'movie_created', { plan });
    return sendSuccess(res, 'Movie plan created successfully.', { plan }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMoviePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await MoviePlan.findById(id);

    if (!plan) {
      return sendError(res, 'Movie plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    const allowedUpdates = [
      'movieName', 'streamingPlatform', 'date', 'watched', 
      'rating', 'review', 'wishlist'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    }

    await plan.save();

    emitToCouple(req.user.relationshipId, 'movie_updated', { plan });
    return sendSuccess(res, 'Movie plan updated successfully.', { plan });
  } catch (error) {
    next(error);
  }
};

export const deleteMoviePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await MoviePlan.findById(id);

    if (!plan) {
      return sendError(res, 'Movie plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await MoviePlan.deleteOne({ _id: id });

    emitToCouple(req.user.relationshipId, 'movie_deleted', { planId: id });
    return sendSuccess(res, 'Movie plan deleted successfully.');
  } catch (error) {
    next(error);
  }
};
