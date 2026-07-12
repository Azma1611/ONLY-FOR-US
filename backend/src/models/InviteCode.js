import mongoose from 'mongoose';

const inviteCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: auto-delete document when current time > expiresAt
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);
export default InviteCode;
