import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';
import { emitToCouple, getIO } from '../socket/socket.js';
import webpush from 'web-push';

// Using standard web-push for PWA browser push notifications
// We fall back to console logging if VAPID keys aren't configured

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@onlyforus.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const dispatchNotification = async ({ userId, relationshipId, title, message, type = 'system', link = '', priority = 'medium' }) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      user: userId,
      relationshipId,
      title,
      message,
      type,
      link,
      priority
    });

    // 2. Realtime Socket Update
    const io = getIO();
    if (io) {
      // We emit directly to the user if connected, or to the couple room
      emitToCouple(relationshipId, 'new_notification', notification);
    }

    // 3. Web Push Notification
    const subscriptions = await PushSubscription.find({ user: userId });
    
    if (subscriptions.length > 0 && process.env.VAPID_PUBLIC_KEY) {
      const payload = JSON.stringify({
        title,
        body: message,
        icon: '/icons/icon-192.png',
        data: { url: link }
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload);
        } catch (pushErr) {
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            // Subscription expired or invalid
            await PushSubscription.findByIdAndDelete(sub._id);
          } else {
            console.error('Push notification error:', pushErr);
          }
        }
      }
    } else if (subscriptions.length > 0) {
      console.log(`[Web Push Mock] User ${userId} | ${title} - ${message}`);
    }

    return notification;
  } catch (error) {
    console.error('Dispatch notification failed:', error);
    return null;
  }
};
