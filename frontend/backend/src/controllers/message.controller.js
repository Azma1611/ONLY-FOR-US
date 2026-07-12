import Message from '../models/Message.js';
import Relationship from '../models/Relationship.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/messages
 */
export const getMessages = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to fetch message history.', 400);
    }

    // Sort by chronological order
    const messages = await Message.find({ relationshipId }).sort({ createdAt: 1 });
    return sendSuccess(res, 'Messages fetched successfully.', { messages });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages
 */
export const sendMessage = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to send messages.', 400);
    }

    const rel = await Relationship.findById(relationshipId);
    if (!rel) {
      return sendError(res, 'Relationship space not found.', 404);
    }

    // Determine partner recipient
    const receiverId = rel.partnerOne.toString() === req.user._id.toString()
      ? rel.partnerTwo
      : rel.partnerOne;

    if (!receiverId) {
      return sendError(res, 'Your partner has not joined the relationship space yet.', 400);
    }

    const { message, messageType } = req.body;
    let attachmentUrl = null;

    if (req.file) {
      // Upload media directly to Cloudinary attachments folder
      attachmentUrl = await uploadToCloudinary(req.file.buffer, 'chat_attachments');
    }

    const newMessage = await Message.create({
      relationshipId,
      sender: req.user._id,
      receiver: receiverId,
      message: message || '',
      messageType: messageType || (req.file ? 'image' : 'text'),
      attachment: attachmentUrl,
      delivered: true,
    });

    logger.info(`Message ID ${newMessage._id} sent from user ${req.user.name} inside relationship ${relationshipId}`);

    // Broadcast message payload to couple socket room
    emitToCouple(relationshipId, 'chat_message', { message: newMessage });

    return sendSuccess(res, 'Message sent successfully.', { message: newMessage }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/:id/seen
 */
export const markAsSeen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return sendError(res, 'Message not found.', 404);
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to mark this message as read.', 403);
    }

    message.seen = true;
    await message.save();

    // Notify partner socket of read receipt
    emitToCouple(message.relationshipId, 'message_seen', {
      messageId: message._id,
      userId: req.user._id,
    });

    return sendSuccess(res, 'Message marked as seen.', { message });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/messages/:id
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return sendError(res, 'Message not found.', 404);
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this message.', 403);
    }

    await Message.deleteOne({ _id: id });
    
    // Broadcast delete event
    emitToCouple(message.relationshipId, 'message_deleted', { messageId: id });

    return sendSuccess(res, 'Message deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/:id
 */
export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return sendError(res, 'Message text is required to update.', 400);
    }

    const msg = await Message.findById(id);

    if (!msg) {
      return sendError(res, 'Message not found.', 404);
    }

    if (msg.sender.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this message.', 403);
    }

    msg.message = message;
    await msg.save();

    // Broadcast edit event to couple room
    emitToCouple(msg.relationshipId, 'message_updated', { message: msg });

    return sendSuccess(res, 'Message updated successfully.', { message: msg });
  } catch (error) {
    next(error);
  }
};

