import { google } from 'googleapis';
import CalendarIntegration from '../models/CalendarIntegration.js';

// Abstracted Google Calendar Service
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = (userId) => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId.toString()
  });
};

export const linkGoogleCalendar = async (code, userId) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log(`[Calendar Mock] Linked user ${userId} with code ${code}`);
      await CalendarIntegration.findOneAndUpdate(
        { user: userId },
        { 
          user: userId, 
          accessToken: 'mock_access', 
          refreshToken: 'mock_refresh',
          expiryDate: Date.now() + 3600000 
        },
        { upsert: true, new: true }
      );
      return true;
    }

    const { tokens } = await oauth2Client.getToken(code);
    await CalendarIntegration.findOneAndUpdate(
      { user: userId },
      { 
        user: userId, 
        accessToken: tokens.access_token, 
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error('Error linking calendar:', error);
    return false;
  }
};

export const pushEventToCalendar = async (userId, eventDetails) => {
  try {
    const integration = await CalendarIntegration.findOne({ user: userId });
    if (!integration) return null;

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log(`[Calendar Mock] Pushed event ${eventDetails.summary} to user ${userId}`);
      return 'mock_event_id';
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventDetails,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error pushing event:', error);
    return null;
  }
};
