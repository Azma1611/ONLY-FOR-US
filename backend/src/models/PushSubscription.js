import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceType: {
    type: String,
    default: 'web',
  },
  userAgent: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
