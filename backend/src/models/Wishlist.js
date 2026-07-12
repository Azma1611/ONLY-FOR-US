import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  url: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purchased: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
