import mongoose from 'mongoose';

const restaurantPlanSchema = new mongoose.Schema({
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
  restaurantName: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    default: '',
  },
  cuisine: {
    type: String,
    default: '',
    trim: true,
  },
  budget: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reservation: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const RestaurantPlan = mongoose.model('RestaurantPlan', restaurantPlanSchema);
export default RestaurantPlan;
