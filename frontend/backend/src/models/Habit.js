import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  owner: {
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
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  streak: {
    type: Number,
    default: 0,
  },
  completedDates: {
    type: [Date],
    default: [],
  },
}, {
  timestamps: true,
});

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
