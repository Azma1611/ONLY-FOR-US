import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  device: {
    type: String,
    default: 'unknown',
  },
  browser: {
    type: String,
    default: 'unknown',
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL cleanup index: auto-delete document when current time > expiresAt
  },
}, {
  timestamps: true,
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
