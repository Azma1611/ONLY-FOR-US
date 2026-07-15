import cron from 'node-cron';
import Reminder from '../models/Reminder.js';
import { dispatchNotification } from './notification.service.js';

export const initCronJobs = () => {
  console.log('Initializing Cron Jobs for Reminders and Emails...');

  // Run every minute to check for due reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find pending reminders where executeAt is in the past
      const dueReminders = await Reminder.find({
        status: 'pending',
        executeAt: { $lte: now }
      });

      for (const reminder of dueReminders) {
        await dispatchNotification({
          userId: reminder.owner,
          relationshipId: reminder.relationshipId,
          title: `Reminder: ${reminder.title}`,
          message: reminder.description || 'You have a pending reminder.',
          type: 'reminder',
          link: `/ecosystem`,
          priority: 'high'
        });

        // Handle recurring reminders
        if (reminder.repeat !== 'none') {
          const nextDate = new Date(reminder.executeAt);
          if (reminder.repeat === 'daily') nextDate.setDate(nextDate.getDate() + 1);
          if (reminder.repeat === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          if (reminder.repeat === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          if (reminder.repeat === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          
          reminder.executeAt = nextDate;
        } else {
          reminder.status = 'notified';
        }

        await reminder.save();
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  // Additional jobs (e.g., Weekly Summary Emails) can be scheduled here
  // cron.schedule('0 9 * * 1', async () => { ... }); // Every Monday at 9AM
};
