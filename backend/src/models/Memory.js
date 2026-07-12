import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
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
  photos: {
    type: [String],
    default: [],
  },
  videos: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Memory = mongoose.model('Memory', memorySchema);
export default Memory;
