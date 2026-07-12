import Message from '../models/Message.js';
import Relationship from '../models/Relationship.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/chat/messages
 * Retrieves paginated messages history for a couple's relationship.
 */
export const getChatMessages = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { limit = 20, page = 1, search } = req.query;

    const query = {
      relationshipId,
      deletedFor: { $ne: req.user._id }
    };

    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }

    const totalMessages = await Message.countDocuments(query);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Reverse messages to return chronological order (oldest first) to frontend
    const chronologicalMessages = messages.reverse();

    return sendSuccess(res, 'Messages retrieved successfully.', {
      messages: chronologicalMessages,
      pagination: {
        totalMessages,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/message
 * Saves a new message and broadcasts it.
 */
export const createChatMessage = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { type, text, mediaUrl, fileName, mimeType, replyTo } = req.body;
    const receiverId = req.user.partnerId;

    const newMessage = await Message.create({
      relationshipId,
      sender: req.user._id,
      receiver: receiverId,
      type: type || 'text',
      text: text || '',
      mediaUrl: mediaUrl || null,
      fileName: fileName || null,
      mimeType: mimeType || null,
      replyTo: replyTo || null,
      deliveredTo: [req.user._id],
      readBy: [req.user._id],
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      });

    // Emit live to room
    emitToCouple(relationshipId, 'receiveMessage', populatedMessage);

    return sendSuccess(res, 'Message created successfully.', { message: populatedMessage }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/chat/message/:id
 * Handles "delete for me" or "delete for everyone".
 */
export const deleteChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'me' } = req.query; // 'me' or 'everyone'
    const message = await Message.findById(id);

    if (!message) {
      return sendError(res, 'Message not found.', 404);
    }

    if (message.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized action.', 403);
    }

    if (type === 'everyone') {
      if (message.sender.toString() !== req.user._id.toString()) {
        return sendError(res, 'You can only delete your own messages for everyone.', 403);
      }

      message.isDeleted = true;
      const oldMediaUrl = message.mediaUrl;
      const mimeType = message.mimeType;

      // Wipe contents for safety
      message.text = 'This message was deleted.';
      message.mediaUrl = null;
      message.fileName = null;
      message.mimeType = null;
      await message.save();

      // Clean up asset from Cloudinary
      if (oldMediaUrl) {
        let resourceType = 'image';
        if (mimeType) {
          if (mimeType.startsWith('video')) resourceType = 'video';
          else if (mimeType.startsWith('audio')) resourceType = 'video';
          else if (!mimeType.startsWith('image')) resourceType = 'raw';
        }
        deleteFromCloudinary(oldMediaUrl, resourceType).catch((err) => {
          logger.error(`Failed to delete asset during message deletion: ${err.message}`);
        });
      }

      // Notify couple room
      emitToCouple(message.relationshipId, 'deleteMessage', { messageId: id, type: 'everyone', message });
    } else {
      // delete for me
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
        await message.save();
      }
    }

    return sendSuccess(res, 'Message deleted successfully.', { messageId: id, type });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/chat/message/:id
 * Edits message content.
 */
export const editChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return sendError(res, 'Message text is required.', 400);
    }

    const message = await Message.findById(id);
    if (!message) {
      return sendError(res, 'Message not found.', 404);
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return sendError(res, 'You can only edit your own messages.', 403);
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const populatedMessage = await Message.findById(id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      });

    // Notify couple room
    emitToCouple(message.relationshipId, 'editMessage', populatedMessage);

    return sendSuccess(res, 'Message updated successfully.', { message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/upload
 * Handles media or general file uploading to Cloudinary.
 */
export const uploadChatFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file provided for upload.', 400);
    }

    const folder = 'chat_attachments';
    const fileUrl = await uploadToCloudinary(req.file.buffer, folder);

    return sendSuccess(res, 'File uploaded successfully.', {
      mediaUrl: fileUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};
