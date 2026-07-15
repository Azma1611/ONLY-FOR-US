import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['water', 'sleep', 'mood', 'workout', 'custom'],
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  },
  value: {
    type: Number, // e.g., ml of water, hours of sleep, mood score (1-5), duration in mins
  },
  notes: {
    type: String, // e.g., "Felt tired today" or "Cardio workout"
  },
  details: {
    // for more specific data: e.g. { moodString: 'happy', workoutType: 'weight training' }
    type: mongoose.Schema.Types.Mixed,
  },
  partnerVisibility: {
    type: Boolean,
    default: false, // Keep health data private by default unless chosen otherwise
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

export default mongoose.model('HealthLog', healthLogSchema);
