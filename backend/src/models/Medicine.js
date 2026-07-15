import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    trim: true,
  },
  time: {
    type: String, // HH:MM
    required: true,
  },
  reminder: {
    type: Boolean,
    default: true,
  },
  completedDates: [{
    type: String // YYYY-MM-DD
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
  }
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
