import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
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
  coverImage: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visibility: {
    type: String,
    enum: ['private', 'shared'],
    default: 'shared',
  }
}, {
  timestamps: true,
});

const Album = mongoose.model('Album', albumSchema);
export default Album;
