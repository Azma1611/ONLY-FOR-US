import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Groceries',
    trim: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const ShoppingItem = mongoose.model('ShoppingItem', shoppingItemSchema);
export default ShoppingItem;
