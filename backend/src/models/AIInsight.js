import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['finance', 'health', 'relationship', 'productivity', 'general'],
    default: 'general',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
  }
}, { timestamps: true });

export default mongoose.model('AIInsight', aiInsightSchema);
