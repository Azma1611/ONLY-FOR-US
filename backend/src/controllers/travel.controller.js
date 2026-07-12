import TravelPlan from '../models/TravelPlan.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';

export const getTravelPlans = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access travel plans.', 400);
    }

    const plans = await TravelPlan.find({ relationshipId }).sort({ startDate: 1, createdAt: -1 });
    return sendSuccess(res, 'Travel plans fetched successfully.', { plans });
  } catch (error) {
    next(error);
  }
};

export const createTravelPlan = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { destination, hotel, budget, startDate, endDate, packingList, tickets, placesToVisit, checklist, timeline } = req.body;

    if (!destination) {
      return sendError(res, 'Destination is required.', 400);
    }

    const plan = await TravelPlan.create({
      relationshipId,
      createdBy: req.user._id,
      destination,
      hotel: hotel || '',
      budget: Number(budget) || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      packingList: packingList || [],
      tickets: tickets || [],
      placesToVisit: placesToVisit || [],
      checklist: checklist || [],
      timeline: timeline || [],
    });

    emitToCouple(relationshipId, 'travel_created', { plan });
    return sendSuccess(res, 'Travel plan created successfully.', { plan }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTravelPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await TravelPlan.findById(id);

    if (!plan) {
      return sendError(res, 'Travel plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    const allowedUpdates = [
      'destination', 'hotel', 'budget', 'startDate', 'endDate', 
      'packingList', 'tickets', 'placesToVisit', 'checklist', 'timeline'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    }

    await plan.save();

    emitToCouple(req.user.relationshipId, 'travel_updated', { plan });
    return sendSuccess(res, 'Travel plan updated successfully.', { plan });
  } catch (error) {
    next(error);
  }
};

export const deleteTravelPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await TravelPlan.findById(id);

    if (!plan) {
      return sendError(res, 'Travel plan not found.', 404);
    }

    if (plan.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await TravelPlan.deleteOne({ _id: id });

    emitToCouple(req.user.relationshipId, 'travel_deleted', { planId: id });
    return sendSuccess(res, 'Travel plan deleted successfully.');
  } catch (error) {
    next(error);
  }
};
