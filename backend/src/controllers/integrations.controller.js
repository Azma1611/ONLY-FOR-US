import { sendSuccess, sendError } from '../utils/response.js';
import { getAuthUrl, linkGoogleCalendar, pushEventToCalendar } from '../services/calendar.service.js';
import { generatePDF, generateCSV, generateZIP } from '../services/export.service.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import Backup from '../models/Backup.js';

export const getCalendarAuthUrl = (req, res) => {
  try {
    const url = getAuthUrl(req.user._id);
    return sendSuccess(res, { url });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const handleCalendarCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    await linkGoogleCalendar(code, userId);
    res.send('<script>window.close()</script>');
  } catch (error) {
    res.status(500).send('Authentication Failed');
  }
};

export const exportData = async (req, res) => {
  try {
    const { format } = req.query; // pdf, csv, zip
    const data = {
      goals: await Goal.find({ relationshipId: req.user.relationshipId }),
      habits: await Habit.find({ relationshipId: req.user.relationshipId }),
    };

    // Log the backup
    await Backup.create({
      type: format.toUpperCase(),
      url: 'generated',
      generatedBy: req.user._id,
      relationshipId: req.user.relationshipId
    });

    if (format === 'pdf') return await generatePDF(data, res);
    if (format === 'csv') return generateCSV(data.goals, res); // Simplified CSV
    if (format === 'zip') return generateZIP(data, res);
    
    return sendError(res, 'Invalid format', 400);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
