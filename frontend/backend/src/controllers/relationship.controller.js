import Relationship from '../models/Relationship.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendInvitationAcceptedEmail } from '../services/email.service.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * POST /api/relationship/create
 */
export const createRelationship = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.relationshipId) {
      return sendError(res, 'You are already in an active relationship.', 400);
    }

    // Initialize relationship space as pending
    const relationship = await Relationship.create({
      relationshipName: `${user.name}'s Couple Space`,
      partnerOne: user._id,
      relationshipStatus: 'pending',
    });

    user.relationshipId = relationship._id;
    await user.save();

    logger.info(`Relationship space initiated: ID ${relationship._id} by user ${user.name}`);

    return sendSuccess(res, 'Relationship space initiated successfully. Awaiting partner join.', {
      relationship,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/relationship/join
 */
export const joinRelationship = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const joiner = req.user;

    if (!inviteCode) {
      return sendError(res, 'Invitation code is required.', 400);
    }

    if (joiner.relationshipId) {
      return sendError(res, 'You are already in an active relationship.', 400);
    }

    // Find partner holding target code
    const inviter = await User.findOne({ invitationCode: inviteCode.trim().toUpperCase() });
    
    if (!inviter) {
      return sendError(res, 'Invalid invitation code.', 400);
    }

    if (inviter._id.toString() === joiner._id.toString()) {
      return sendError(res, 'You cannot join using your own invitation code.', 400);
    }

    if (inviter.relationshipId) {
      // Check if inviter is in an active pairing or has a pending slot
      const existingRel = await Relationship.findById(inviter.relationshipId);
      if (existingRel && existingRel.partnerTwo) {
        return sendError(res, 'The owner of this invitation code is already in a full relationship.', 400);
      }
    }

    let relationship;

    if (inviter.relationshipId) {
      // If inviter already created a pending space, update it
      relationship = await Relationship.findById(inviter.relationshipId);
      relationship.partnerTwo = joiner._id;
      relationship.relationshipStatus = 'active';
      relationship.relationshipName = `${inviter.name} & ${joiner.name}'s Space`;
      await relationship.save();
    } else {
      // Create new relationship
      relationship = await Relationship.create({
        relationshipName: `${inviter.name} & ${joiner.name}'s Space`,
        partnerOne: inviter._id,
        partnerTwo: joiner._id,
        relationshipStatus: 'active',
      });
    }

    // Bind relationshipId to both user accounts
    inviter.relationshipId = relationship._id;
    joiner.relationshipId = relationship._id;
    await inviter.save();
    await joiner.save();

    logger.info(`Relationship linked: ID ${relationship._id} between ${inviter.name} and ${joiner.name}`);

    // Email inviter about successful connect
    await sendInvitationAcceptedEmail(inviter.email, inviter.name, joiner.name);

    // Broadcast live dashboard join event via Socket room
    emitToCouple(relationship._id, 'partner_joined', {
      relationship,
      partner: joiner,
    });

    return sendSuccess(res, 'Connected successfully! Your shared space is ready.', {
      relationship,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/relationship
 */
export const getRelationship = async (req, res, next) => {
  try {
    if (!req.user.relationshipId) {
      return sendSuccess(res, 'No active relationship space connected.', { relationship: null });
    }

    const relationship = await Relationship.findById(req.user.relationshipId)
      .populate('partnerOne', '-password')
      .populate('partnerTwo', '-password');

    return sendSuccess(res, 'Relationship details fetched successfully.', { relationship });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/relationship
 */
export const updateRelationship = async (req, res, next) => {
  try {
    if (!req.user.relationshipId) {
      return sendError(res, 'You must be in a relationship to update shared settings.', 400);
    }

    const allowedUpdates = ['relationshipName', 'anniversary', 'sharedTheme'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const relationship = await Relationship.findByIdAndUpdate(
      req.user.relationshipId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Emit updated space specs to couples via sockets
    emitToCouple(req.user.relationshipId, 'relationship_updated', { relationship });

    logger.info(`Relationship settings updated: ID ${relationship._id}`);

    return sendSuccess(res, 'Relationship settings updated successfully.', { relationship });
  } catch (error) {
    next(error);
  }
};
