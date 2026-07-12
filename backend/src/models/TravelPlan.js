import mongoose from 'mongoose';

const travelPlanSchema = new mongoose.Schema({
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
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  hotel: {
    type: String,
    default: '',
  },
  budget: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  packingList: [
    {
      item: { type: String, required: true },
      packed: { type: Boolean, default: false }
    }
  ],
  tickets: [
    {
      title: { type: String, required: true },
      code: { type: String, default: '' },
      docUrl: { type: String, default: '' }
    }
  ],
  placesToVisit: [
    {
      place: { type: String, required: true },
      visited: { type: Boolean, default: false },
      notes: { type: String, default: '' }
    }
  ],
  checklist: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  timeline: [
    {
      time: { type: String, default: '' },
      activity: { type: String, required: true },
      notes: { type: String, default: '' }
    }
  ]
}, {
  timestamps: true,
});

const TravelPlan = mongoose.model('TravelPlan', travelPlanSchema);
export default TravelPlan;
