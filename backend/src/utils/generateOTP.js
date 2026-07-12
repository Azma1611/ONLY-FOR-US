/**
 * Generates a random 6-digit numeric OTP (e.g., "482731").
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default generateOTP;
