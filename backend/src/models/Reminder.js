import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    default: '',
  },
  remindAt: {
    type: Date,
    required: true,
    index: true,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['in-app', 'browser', 'email'],
    default: 'in-app',
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent',
    default: null,
  }
}, {
  timestamps: true,
});

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
