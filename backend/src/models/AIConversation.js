import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Chat',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('AIConversation', aiConversationSchema);
