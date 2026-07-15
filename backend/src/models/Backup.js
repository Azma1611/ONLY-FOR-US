import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PDF', 'CSV', 'JSON', 'ZIP'],
    required: true,
  },
  url: {
    type: String, // Or file path
    required: true,
  },
  size: {
    type: Number,
    default: 0,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('Backup', backupSchema);
