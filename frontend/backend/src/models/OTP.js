import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['verification', 'reset_password', 'other'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: auto-delete document when current time > expiresAt
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash the OTP prior to saving
otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validate candidate OTP
otpSchema.methods.compareOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.otp);
};

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
