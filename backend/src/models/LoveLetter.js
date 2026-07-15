import mongoose from 'mongoose';

const loveLetterSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  theme: {
    type: String,
    default: 'classic', // classic, dark, romantic, minimalist
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  scheduledFor: {
    type: Date,
    default: null,
  },
  visibility: {
    type: String,
    enum: ['private', 'shared'],
    default: 'shared',
  }
}, {
  timestamps: true,
});

const LoveLetter = mongoose.model('LoveLetter', loveLetterSchema);
export default LoveLetter;
