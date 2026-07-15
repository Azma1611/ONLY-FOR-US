import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Ensure a habit can only have one log per day
habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.model('HabitLog', habitLogSchema);
