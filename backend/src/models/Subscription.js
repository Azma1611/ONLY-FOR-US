import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  service: {
    type: String,
    required: true,
    trim: true,
  },
  monthlyCost: {
    type: Number,
    required: true,
    min: 0,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: ['Streaming', 'Software', 'Music', 'Gaming', 'Cloud', 'News', 'Other'],
    default: 'Other',
  },
  reminder: {
    type: String,
    enum: ['none', '1_day', '3_days', '1_week'],
    default: 'none',
  },
}, {
  timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
