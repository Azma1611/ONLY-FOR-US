import * as inviteService from '../services/invite.service.js';
import * as relationshipService from '../services/relationship.service.js';
import Relationship from '../models/Relationship.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendInvitationAcceptedEmail } from '../services/email.service.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * POST /api/partner/create-invite
 */
export const createInviteCode = async (req, res, next) => {
  try {
    const invite = await inviteService.createInvite(req.user._id);
    logger.info(`Invite code generated: ${invite.code} by user ${req.user.name}`);
    return sendSuccess(res, 'Invite code generated successfully.', {
      inviteCode: invite.code,
      expiresAt: invite.expiresAt,
      invite,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/partner/my-invite
 */
export const getActiveInvite = async (req, res, next) => {
  try {
    const invite = await inviteService.getInvite(req.user._id);
    if (!invite) {
      return sendSuccess(res, 'No active invite code found.', { invite: null });
    }
    return sendSuccess(res, 'Active invite code fetched successfully.', {
      inviteCode: invite.code,
      expiresAt: invite.expiresAt,
      invite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/partner/join
 */
export const joinPartner = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return sendError(res, 'Invite code is required.', 400);
    }

    const { relationship, partner } = await relationshipService.joinRelationship(
      req.user._id,
      code
    );

    logger.info(`Users connected: ID ${relationship._id} between ${partner.name} and ${req.user.name}`);

    // Email partner (inviter) about successful connect
    try {
      await sendInvitationAcceptedEmail(partner.email, partner.name, req.user.name);
    } catch (emailErr) {
      logger.error('Failed sending invitation accepted email:', emailErr);
    }

    // Broadcast live dashboard join event via Socket room
    try {
      emitToCouple(relationship._id, 'partner_joined', {
        relationship,
        partner: req.user,
      });
    } catch (socketErr) {
      logger.error('Failed broadcasting partner_joined socket event:', socketErr);
    }

    return sendSuccess(res, 'Connected successfully! Your shared space is ready.', {
      relationship,
      partner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/partner/status
 */
export const getPartnerStatus = async (req, res, next) => {
  try {
    if (!req.user.relationshipId || !req.user.isConnected) {
      return sendSuccess(res, 'Not connected.', {
        connected: false,
        paired: false,
        relationship: null,
        partner: null,
      });
    }

    const relationship = await Relationship.findById(req.user.relationshipId);
    if (!relationship) {
      return sendSuccess(res, 'Not connected.', {
        connected: false,
        paired: false,
        relationship: null,
        partner: null,
      });
    }

    // Identify the partner
    const partnerId = req.user._id.toString() === relationship.partnerOne.toString()
      ? relationship.partnerTwo
      : relationship.partnerOne;

    if (!partnerId) {
      // Pending state (partnerOne is set but partnerTwo is null)
      return sendSuccess(res, 'Awaiting partner to connect.', {
        connected: false,
        paired: false,
        relationship,
        partner: null,
      });
    }

    const partner = await User.findById(partnerId, '-password');

    return sendSuccess(res, 'Connection status fetched successfully.', {
      connected: true,
      paired: true,
      relationship,
      partner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/partner/disconnect
 */
export const disconnectPartner = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    
    await relationshipService.disconnectRelationship(req.user._id);
    logger.info(`Relationship space disconnected: ID ${relationshipId} by user ${req.user.name}`);

    // Broadcast disconnection event via socket
    if (relationshipId) {
      try {
        emitToCouple(relationshipId, 'partner_disconnected', {
          message: 'Your partner has disconnected the shared space.',
        });
      } catch (socketErr) {
        logger.error('Failed broadcasting partner_disconnected socket event:', socketErr);
      }
    }

    return sendSuccess(res, 'Shared space disconnected and deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/partner/regenerate
 */
export const regenerateInviteCode = async (req, res, next) => {
  try {
    const invite = await inviteService.regenerateInvite(req.user._id);
    logger.info(`Invite code regenerated: ${invite.code} by user ${req.user.name}`);
    return sendSuccess(res, 'Invite code regenerated successfully.', {
      inviteCode: invite.code,
      expiresAt: invite.expiresAt,
      invite,
    });
  } catch (error) {
    next(error);
  }
};
