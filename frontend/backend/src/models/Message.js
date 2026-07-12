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
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'voice', 'attachment'],
    default: 'text',
  },
  attachment: {
    type: String,
    default: null,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
