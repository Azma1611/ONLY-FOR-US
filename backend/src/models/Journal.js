import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    default: 'neutral',
    trim: true,
  },
  images: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;
