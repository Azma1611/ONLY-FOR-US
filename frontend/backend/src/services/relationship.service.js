import Relationship from '../models/Relationship.js';
import User from '../models/User.js';
import InviteCode from '../models/InviteCode.js';

/**
 * Validates the invite code, creates the active Relationship, binds users, and cleans up old codes
 */
export const joinRelationship = async (joinerId, inviteCodeStr) => {
  const codeNormalized = inviteCodeStr.trim().toUpperCase();

  // Find the invite
  const invite = await InviteCode.findOne({ code: codeNormalized });
  if (!invite) {
    const error = new Error('Invalid invite code.');
    error.statusCode = 404;
    throw error;
  }

  if (invite.isUsed) {
    const error = new Error('Invite already used.');
    error.statusCode = 400;
    throw error;
  }

  if (invite.expiresAt < new Date()) {
    const error = new Error('Invite expired.');
    error.statusCode = 400;
    throw error;
  }

  const inviterId = invite.owner.toString();
  if (inviterId === joinerId.toString()) {
    const error = new Error('You cannot join your own invite code.');
    error.statusCode = 400;
    throw error;
  }

  const joiner = await User.findById(joinerId);
  const inviter = await User.findById(invite.owner);

  if (!joiner || !inviter) {
    const error = new Error('User accounts associated with this transaction could not be located.');
    error.statusCode = 404;
    throw error;
  }

  if (joiner.isConnected || joiner.relationshipId) {
    const error = new Error('You are already connected in a relationship.');
    error.statusCode = 400;
    throw error;
  }

  if (inviter.isConnected || inviter.relationshipId) {
    const error = new Error('Partner is already connected in another relationship.');
    error.statusCode = 400;
    throw error;
  }

  // Create the Relationship
  const relationship = await Relationship.create({
    relationshipName: `${inviter.name} & ${joiner.name}'s Space`,
    partnerOne: inviter._id,
    partnerTwo: joiner._id,
    status: 'active',
    relationshipStatus: 'active', // maintain backward compatibility
    connectedAt: new Date(),
  });

  // Update both Users
  joiner.relationshipId = relationship._id;
  joiner.partnerId = inviter._id;
  joiner.isConnected = true;

  inviter.relationshipId = relationship._id;
  inviter.partnerId = joiner._id;
  inviter.isConnected = true;

  await joiner.save();
  await inviter.save();

  // Mark invite as used
  invite.isUsed = true;
  invite.usedBy = joiner._id;
  invite.relationship = relationship._id;
  await invite.save();

  // Delete all old invites owned by either user
  await InviteCode.deleteMany({ owner: { $in: [joiner._id, inviter._id] } });

  return {
    relationship,
    partner: inviter,
  };
};

/**
 * Disconnects the active couple relationship and wipes associated invite logs
 */
export const disconnectRelationship = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.relationshipId || !user.isConnected) {
    const error = new Error('You are not in an active relationship.');
    error.statusCode = 400;
    throw error;
  }

  const relationshipId = user.relationshipId;
  const partnerId = user.partnerId;

  // Update the users first
  user.relationshipId = null;
  user.partnerId = null;
  user.isConnected = false;
  await user.save();

  if (partnerId) {
    const partner = await User.findById(partnerId);
    if (partner) {
      partner.relationshipId = null;
      partner.partnerId = null;
      partner.isConnected = false;
      await partner.save();
    }
  }

  // Delete the Relationship document
  await Relationship.deleteOne({ _id: relationshipId });

  // Delete any InviteCodes owned by either user
  await InviteCode.deleteMany({ owner: { $in: [user._id, partnerId].filter(Boolean) } });

  return true;
};
