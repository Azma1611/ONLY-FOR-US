import mongoose from 'mongoose';

const moviePlanSchema = new mongoose.Schema({
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
  movieName: {
    type: String,
    required: true,
    trim: true,
  },
  streamingPlatform: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    default: null,
  },
  watched: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  review: {
    type: String,
    default: '',
  },
  wishlist: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const MoviePlan = mongoose.model('MoviePlan', moviePlanSchema);
export default MoviePlan;
