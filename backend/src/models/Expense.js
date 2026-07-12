import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
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
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shared: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
