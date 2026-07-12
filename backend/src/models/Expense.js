import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['Food', 'Shopping', 'Travel', 'Bills', 'Medical', 'Education', 'Entertainment', 'Transport', 'Rent', 'Subscriptions', 'Pets', 'Home', 'Gifts', 'Other'],
    default: 'Other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  shared: {
    type: Boolean,
    default: true,
  },
  splitPercentage: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  receiptImage: {
    type: String, // URL from Cloudinary or local path
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
