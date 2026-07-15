import mongoose from 'mongoose';

const aiSettingsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'claude'],
    default: 'gemini',
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1,
  },
  memoryEnabled: {
    type: Boolean,
    default: true,
  },
  personality: {
    type: String,
    default: 'helpful and friendly',
  }
}, { timestamps: true });

export default mongoose.model('AISettings', aiSettingsSchema);
