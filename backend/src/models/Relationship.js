import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
  relationshipName: {
    type: String,
    default: 'Our Private Space',
    trim: true,
  },
  partnerOne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partnerTwo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  connectedAt: {
    type: Date,
    default: null,
  },
  anniversary: {
    type: Date,
    default: null,
  },
  relationshipStatus: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'disconnected'],
    default: 'pending',
  },
  sharedTheme: {
    type: String,
    default: 'default',
  },
}, {
  timestamps: true,
});

const Relationship = mongoose.model('Relationship', relationshipSchema);
export default Relationship;
