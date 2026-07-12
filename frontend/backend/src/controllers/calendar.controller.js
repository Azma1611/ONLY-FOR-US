import CalendarEvent from '../models/CalendarEvent.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/calendar
 */
export const getEvents = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access calendar events.', 400);
    }

    // Sort by chronological order
    const events = await CalendarEvent.find({ relationshipId }).sort({ date: 1 });
    return sendSuccess(res, 'Calendar events fetched successfully.', { events });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/calendar
 */
export const createEvent = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to create calendar events.', 400);
    }

    const { title, description, date, category, reminder } = req.body;
    if (!title || !date) {
      return sendError(res, 'Event title and target date are required.', 400);
    }

    const event = await CalendarEvent.create({
      relationshipId,
      title,
      description: description || '',
      date,
      category: category || 'General',
      reminder: !!reminder,
    });

    logger.info(`Calendar Event created: ${event.title} in relationship space ${relationshipId}`);

    // Emit socket event for live updates
    emitToCouple(relationshipId, 'event_created', { event });

    return sendSuccess(res, 'Calendar event created successfully.', { event }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/calendar/:id
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);

    if (!event) {
      return sendError(res, 'Calendar event not found.', 404);
    }

    if (event.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to edit this event.', 403);
    }

    const allowedUpdates = ['title', 'description', 'date', 'category', 'reminder'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    }

    await event.save();

    logger.info(`Calendar Event updated: ID ${event._id}`);

    // Emit socket update event
    emitToCouple(req.user.relationshipId, 'event_updated', { event });

    return sendSuccess(res, 'Calendar event updated successfully.', { event });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/calendar/:id
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);

    if (!event) {
      return sendError(res, 'Calendar event not found.', 404);
    }

    if (event.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to delete this event.', 403);
    }

    await CalendarEvent.deleteOne({ _id: id });

    logger.info(`Calendar Event deleted: ID ${id}`);

    // Emit socket delete event
    emitToCouple(req.user.relationshipId, 'event_deleted', { eventId: id });

    return sendSuccess(res, 'Calendar event deleted successfully.');
  } catch (error) {
    next(error);
  }
};
