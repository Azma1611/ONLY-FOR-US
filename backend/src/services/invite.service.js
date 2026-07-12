import crypto from 'crypto';
import InviteCode from '../models/InviteCode.js';
import User from '../models/User.js';

/**
 * Generates a secure, true random alphanumeric character block matching 'OFU-XXXX-XXXX'
 */
export const generateSecureRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getSegment = () => {
    let seg = '';
    for (let i = 0; i < 4; i++) {
      const randIdx = crypto.randomInt(0, chars.length);
      seg += chars[randIdx];
    }
    return seg;
  };
  return `OFU-${getSegment()}-${getSegment()}`;
};

/**
 * Obtains a unique invite code that does not exist in the database
 */
export const getUniqueInviteCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = generateSecureRandomCode();
    const count = await InviteCode.countDocuments({ code });
    if (count === 0) {
      exists = false;
    }
  }
  return code;
};

/**
 * Creates an invite code for a user
 */
export const createInvite = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.isConnected || user.relationshipId) {
    const error = new Error('Cannot invite. You are already connected in a relationship.');
    error.statusCode = 400;
    throw error;
  }

  // Delete any old invites owned by this user
  await InviteCode.deleteMany({ owner: userId });

  const inviteCodeStr = await getUniqueInviteCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const invite = await InviteCode.create({
    code: inviteCodeStr,
    owner: userId,
    expiresAt,
    isUsed: false,
  });

  return invite;
};

/**
 * Returns the currently active, non-expired, unused invite code owned by the user
 */
export const getInvite = async (userId) => {
  const invite = await InviteCode.findOne({
    owner: userId,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
  return invite;
};

/**
 * Deletes old invites and generates a new active invite code for the user
 */
export const regenerateInvite = async (userId) => {
  // Check connection status first
  const user = await User.findById(userId);
  if (user.isConnected || user.relationshipId) {
    const error = new Error('Cannot regenerate. You are already connected in a relationship.');
    error.statusCode = 400;
    throw error;
  }

  // Delete all existing codes
  await InviteCode.deleteMany({ owner: userId });

  // Create new invite
  return createInvite(userId);
};
