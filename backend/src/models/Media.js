import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    relationshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Relationship',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String
    },
    originalFileName: {
      type: String
    },
    fileSize: {
      type: Number // in bytes
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    mimeType: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    downloadedCount: {
      type: Number,
      default: 0
    },
    viewed: {
      type: Boolean,
      default: false
    },
    favoritedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    deletedForSender: {
      type: Boolean,
      default: false
    },
    deletedForReceiver: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Media', mediaSchema);
