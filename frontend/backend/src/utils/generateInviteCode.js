/**
 * Generates a unique, uppercase alphanumeric invitation code in the format "OFU-XXXXXX".
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OFU-${randomPart}`;
};

export default generateInviteCode;
