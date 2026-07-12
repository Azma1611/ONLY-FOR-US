import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  listName: {
    type: String,
    default: 'Personal', // Personal, Shared, Work, etc.
  },
  checklist: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  completed: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0, // percentage of checklist completion
  },
  archived: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
