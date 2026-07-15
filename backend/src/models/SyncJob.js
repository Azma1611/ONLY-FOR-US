import mongoose from 'mongoose';

const syncJobSchema = new mongoose.Schema({
  action: {
    type: String, // e.g. 'CREATE_GOAL', 'UPDATE_EXPENSE'
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'failed'],
    default: 'pending',
    index: true,
  },
  error: {
    type: String,
    default: '',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('SyncJob', syncJobSchema);
