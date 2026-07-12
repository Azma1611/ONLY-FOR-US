import CalendarEvent from '../models/CalendarEvent.js';
import Reminder from '../models/Reminder.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

const getReminderOffsetMs = (offset) => {
  switch (offset) {
    case '5_min': return 5 * 60 * 1000;
    case '10_min': return 10 * 60 * 1000;
    case '30_min': return 30 * 60 * 1000;
    case '1_hour': return 60 * 60 * 1000;
    case '1_day': return 24 * 60 * 60 * 1000;
    case '1_week': return 7 * 24 * 60 * 60 * 1000;
    default: return 0;
  }
};

const scheduleReminders = async (event, req) => {
  try {
    // Clear old reminders first
    await Reminder.deleteMany({ eventId: event._id });

    if (event.reminderTime && event.reminderTime !== 'none') {
      const offsetMs = getReminderOffsetMs(event.reminderTime);
      const remindAt = new Date(new Date(event.startDate).getTime() - offsetMs);

      if (remindAt > new Date()) {
        const userIds = [req.user._id, req.user.partnerId].filter(Boolean);
        for (const uid of userIds) {
          await Reminder.create({
            relationshipId: event.relationshipId,
            userId: uid,
            title: `Upcoming: ${event.title}`,
            message: event.description || `Event is scheduled for ${new Date(event.startDate).toLocaleString()}`,
            remindAt,
            type: 'in-app',
            eventId: event._id,
          });
        }
        logger.info(`Scheduled reminders for event: ${event.title} at ${remindAt}`);
      }
    }
  } catch (err) {
    logger.error(`Error scheduling reminders: ${err.message}`);
  }
};

/**
 * GET /api/calendar
 */
export const getEvents = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access calendar events.', 400);
    }

    const events = await CalendarEvent.find({ relationshipId }).sort({ startDate: 1 });
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

    const { 
      title, description, category, startDate, endDate, allDay, 
      location, notes, reminderTime, repeatType, repeatUntil, 
      color, priority, status, budget, checklist 
    } = req.body;

    if (!title || !startDate || !endDate) {
      return sendError(res, 'Event title, start date, and end date are required.', 400);
    }

    const event = await CalendarEvent.create({
      relationshipId,
      createdBy: req.user._id,
      title,
      description: description || '',
      category: category || 'shared',
      startDate,
      endDate,
      allDay: !!allDay,
      location: location || '',
      notes: notes || '',
      reminderTime: reminderTime || 'none',
      repeatType: repeatType || 'none',
      repeatUntil: repeatUntil || null,
      color: color || '#FF4D88',
      priority: priority || 'medium',
      status: status || 'confirmed',
      budget: Number(budget) || 0,
      checklist: checklist || [],
      participants: [req.user._id, req.user.partnerId].filter(Boolean),
    });

    // Schedule notifications if reminder offset is selected
    await scheduleReminders(event, req);

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

    const allowedUpdates = [
      'title', 'description', 'category', 'startDate', 'endDate', 'allDay', 
      'location', 'notes', 'reminderTime', 'repeatType', 'repeatUntil', 
      'color', 'priority', 'status', 'budget', 'checklist', 'participants'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    }

    await event.save();

    // Re-schedule reminders based on modified times
    await scheduleReminders(event, req);

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

    // Delete associated reminders first
    await Reminder.deleteMany({ eventId: id });
    await CalendarEvent.deleteOne({ _id: id });

    logger.info(`Calendar Event deleted: ID ${id}`);

    // Emit socket delete event
    emitToCouple(req.user.relationshipId, 'event_deleted', { eventId: id });

    return sendSuccess(res, 'Calendar event deleted successfully.');
  } catch (error) {
    next(error);
  }
};
