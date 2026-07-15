import mongoose from 'mongoose';

const productivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['study_subject', 'study_assignment', 'study_exam', 'work_project', 'work_task', 'work_meeting'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: { // For exams, deadlines, or meeting dates
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  progress: {
    type: Number, // 0-100 for projects/subjects
    default: 0,
  },
  details: {
    // Arbitrary extra details e.g., location for meetings, subjectId for assignments
    type: mongoose.Schema.Types.Mixed,
  },
  visibility: {
    type: String,
    enum: ['private', 'shared'],
    default: 'private', // Work/Study usually personal unless explicitly shared
  },
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

export default mongoose.model('Productivity', productivitySchema);
