import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
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
  reminder: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
}, {
  timestamps: true,
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
