import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  reminder: {
    type: String,
    enum: ['none', '1_day', '3_days', '1_week'],
    default: 'none',
  },
}, {
  timestamps: true,
});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
