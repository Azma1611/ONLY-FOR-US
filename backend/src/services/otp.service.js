import OTP from '../models/OTP.js';
import generateOTP from '../utils/generateOTP.js';

/**
 * Creates a new OTP for a given email, invalidating previous pending OTPs.
 * Returns the raw OTP string so it can be sent via email.
 */
export const createOTP = async (email, purpose) => {
  // Invalidate previous OTPs for same email & purpose
  await OTP.deleteMany({ email, purpose });

  const rawOtp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Saved document will auto-hash OTP via its schema pre-save hook
  await OTP.create({
    email,
    otp: rawOtp,
    purpose,
    expiresAt,
  });

  return rawOtp;
};

/**
 * Verifies a candidate OTP. Returns true on success and deletes the validated OTP.
 */
export const verifyOTP = async (email, otpCode, purpose) => {
  // Query active, non-expired OTPs for the user
  const otpRecords = await OTP.find({
    email,
    purpose,
    expiresAt: { $gt: new Date() },
  });

  for (const record of otpRecords) {
    const isMatch = await record.compareOTP(otpCode);
    if (isMatch) {
      // OTP works only once — delete immediately
      await OTP.deleteOne({ _id: record._id });
      return true;
    }
  }

  return false;
};
