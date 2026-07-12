import RestaurantPlan from '../models/RestaurantPlan.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';

export const getRestaurantPlans = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access restaurant plans.', 400);
    }

    const plans = await RestaurantPlan.find({ relationshipId }).sort({ reservation: 1, createdAt: -1 });
    return sendSuccess(res, 'Restaurant plans fetched successfully.', { plans });
  } catch (error) {
    next(error);
  }
};

export const createRestaurantPlan = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { restaurantName, location, cuisine, budget, rating, reservation, notes } = req.body;

    if (!restaurantName) {
      return sendError(res, 'Restaurant name is required.', 400);
    }

    const plan = await RestaurantPlan.create({
      relationshipId,
      createdBy: req.user._id,
      restaurantName,
      location: location || '',
      cuisine: cuisine || '',
      budget: budget || '$$',
      rating: Number(rating) || 0,
      reservation: reservation || null,
      notes: notes || '',
    });

    emitToCouple(relationshipId, 'restaurant_created', { plan });
    return sendSuccess(res, 'Restaurant plan created successfully.', { plan }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await RestaurantPlan.findById(id);

    if (!plan) {
      return sendError(res, 'Restaurant plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    const allowedUpdates = [
      'restaurantName', 'location', 'cuisine', 'budget', 
      'rating', 'reservation', 'notes'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    }

    await plan.save();

    emitToCouple(req.user.relationshipId, 'restaurant_updated', { plan });
    return sendSuccess(res, 'Restaurant plan updated successfully.', { plan });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurantPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await RestaurantPlan.findById(id);

    if (!plan) {
      return sendError(res, 'Restaurant plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await RestaurantPlan.deleteOne({ _id: id });

    emitToCouple(req.user.relationshipId, 'restaurant_deleted', { planId: id });
    return sendSuccess(res, 'Restaurant plan deleted successfully.');
  } catch (error) {
    next(error);
  }
};
