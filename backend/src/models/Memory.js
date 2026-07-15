import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
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
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    default: null,
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
  mediaType: {
    type: String,
    enum: ['photo', 'video', 'voice', 'text', 'place', 'milestone'],
    default: 'photo',
  },
  mediaUrl: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String],
    default: [],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  visibility: {
    type: String,
    enum: ['private', 'shared'],
    default: 'shared',
  },
  weather: {
    type: String,
    default: '',
  },
  mood: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Memory = mongoose.model('Memory', memorySchema);
export default Memory;
