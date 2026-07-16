import mongoose from 'mongoose';

/**
 * RelationshipTheme — stores the synchronized mood theme for a couple.
 * One document per relationship. The theme value drives CSS variables
 * across the entire frontend for both partners.
 *
 * @typedef {'love' | 'normal' | 'sad' | 'angry'} MoodTheme
 */
const relationshipThemeSchema = new mongoose.Schema({
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true,
    unique: true,
    index: true,
  },
  theme: {
    type: String,
    enum: ['love', 'normal', 'sad', 'angry'],
    default: 'normal',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false, // We manage updatedAt manually for clarity
});

const RelationshipTheme = mongoose.model('RelationshipTheme', relationshipThemeSchema);
export default RelationshipTheme;
