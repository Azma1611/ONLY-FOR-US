import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['first_meeting', 'first_date', 'engagement', 'wedding', 'custom', 'anniversary'],
    default: 'custom',
  }
}, {
  timestamps: true,
});

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
