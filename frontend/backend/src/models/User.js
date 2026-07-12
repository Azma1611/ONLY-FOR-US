import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    default: null,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  invitationCode: {
    type: String,
    unique: true,
    index: true,
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'dark',
  },
  language: {
    type: String,
    default: 'en',
  },
  notificationSettings: {
    type: Map,
    of: Boolean,
    default: {
      messages: true,
      goals: true,
      habits: true,
      calendar: true,
      finances: true,
    },
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  onlineStatus: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
}, {
  timestamps: true,
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON scrubbing helper
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
