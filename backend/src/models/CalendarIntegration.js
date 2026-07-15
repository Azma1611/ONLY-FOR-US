import mongoose from 'mongoose';

const calendarIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    enum: ['google'],
    default: 'google',
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  syncToken: {
    type: String,
    default: '',
  },
  expiryDate: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('CalendarIntegration', calendarIntegrationSchema);
