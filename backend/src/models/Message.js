import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'voice', 'file', 'system'],
    default: 'text',
  },
  text: {
    type: String,
    default: '',
  },
  mediaUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  mimeType: {
    type: String,
    default: null,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  reactions: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      emoji: {
        type: String,
      },
    }
  ],
  isEdited: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  deliveredTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  deletedFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
}, {
  timestamps: true,
});

// Compound index for chronological querying within a relationship
messageSchema.index({ relationshipId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
