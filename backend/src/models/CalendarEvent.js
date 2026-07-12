import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'anniversary', 'birthday', 'date_night', 'movie_night', 'restaurant', 
      'shopping', 'study', 'exam', 'work', 'meeting', 'vacation', 'travel', 
      'gym', 'doctor', 'prayer', 'bills', 'finance', 'goal', 'habit', 
      'reminder', 'personal', 'shared'
    ],
    default: 'shared',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  reminderTime: {
    type: String,
    enum: ['none', '5_min', '10_min', '30_min', '1_hour', '1_day', '1_week'],
    default: 'none',
  },
  repeatType: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none',
  },
  repeatUntil: {
    type: Date,
    default: null,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  color: {
    type: String,
    default: '#FF4D88',
  },
  attachments: [
    {
      type: String,
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  // Date Planner inline extensions
  budget: {
    type: Number,
    default: 0,
  },
  checklist: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ]
}, {
  timestamps: true,
});

// Add indices for calendar indexing queries
calendarEventSchema.index({ relationshipId: 1, startDate: 1, endDate: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
