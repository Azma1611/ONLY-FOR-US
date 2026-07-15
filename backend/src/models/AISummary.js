import mongoose from 'mongoose';

const aiSummarySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  type: {
    type: String,
    enum: ['morning', 'night'],
    required: true,
  },
  content: {
    type: String,
    required: true,
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

export default mongoose.model('AISummary', aiSummarySchema);
