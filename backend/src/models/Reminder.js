import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  module: {
    type: String,
    enum: ['planner', 'goals', 'habits', 'bills', 'savings', 'medicine', 'calendar', 'birthdays', 'anniversaries', 'love_letters', 'study', 'work', 'ai_summary', 'custom'],
    default: 'custom',
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  executeAt: {
    type: Date,
    required: true,
    index: true,
  },
  snoozeUntil: {
    type: Date,
    default: null,
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none',
  },
  status: {
    type: String,
    enum: ['pending', 'notified', 'dismissed'],
    default: 'pending',
  },
  owner: {
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

export default mongoose.model('Reminder', reminderSchema);
