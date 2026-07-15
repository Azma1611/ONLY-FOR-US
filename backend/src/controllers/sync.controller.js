import SyncJob from '../models/SyncJob.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const pushOfflineQueue = async (req, res) => {
  try {
    const { queue } = req.body; // Array of pending jobs
    if (!Array.isArray(queue)) return sendError(res, 'Queue must be an array', 400);

    const jobs = queue.map(job => ({
      action: job.action,
      payload: job.payload,
      status: 'pending',
      createdBy: req.user._id,
      relationshipId: req.user.relationshipId
    }));

    await SyncJob.insertMany(jobs);
    
    // In a real application, you'd trigger a background worker here
    // For now, we mock resolution
    await SyncJob.updateMany({ createdBy: req.user._id, status: 'pending' }, { status: 'resolved' });

    return sendSuccess(res, { message: 'Sync queued and processed successfully' });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getSyncStatus = async (req, res) => {
  try {
    const pendingCount = await SyncJob.countDocuments({ relationshipId: req.user.relationshipId, status: 'pending' });
    const failedCount = await SyncJob.countDocuments({ relationshipId: req.user.relationshipId, status: 'failed' });
    
    return sendSuccess(res, { pendingCount, failedCount });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
