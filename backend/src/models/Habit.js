import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily',
  },
  category: {
    type: String,
    default: 'custom', // could be fitness, study, health, etc.
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  partnerVisibility: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
  }
}, { timestamps: true });

export default mongoose.model('Habit', habitSchema);
