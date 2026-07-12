import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['Total', 'Food', 'Shopping', 'Travel', 'Bills', 'Medical', 'Education', 'Entertainment', 'Transport', 'Rent', 'Subscriptions', 'Pets', 'Home', 'Gifts', 'Other'],
    default: 'Total',
  },
  limitAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  monthYear: {
    type: String, // format YYYY-MM
    required: true,
  },
}, {
  timestamps: true,
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
