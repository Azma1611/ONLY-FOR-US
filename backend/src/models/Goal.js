import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['personal', 'relationship', 'financial', 'study', 'fitness', 'career', 'custom'],
    default: 'custom',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  deadline: {
    type: Date,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  checklist: [{
    text: String,
    completed: { type: Boolean, default: false }
  }],
  milestones: [{
    title: String,
    date: Date,
    completed: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  completedDate: {
    type: Date,
  },
  visibility: {
    type: String,
    enum: ['private', 'shared'],
    default: 'shared',
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

export default mongoose.model('Goal', goalSchema);
