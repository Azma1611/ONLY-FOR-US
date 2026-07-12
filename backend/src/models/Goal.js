import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  deadline: {
    type: Date,
    default: null,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
