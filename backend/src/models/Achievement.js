import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
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

// Prevent unlocking the same badge multiple times
achievementSchema.index({ badgeId: 1, owner: 1 }, { unique: true });

export default mongoose.model('Achievement', achievementSchema);
