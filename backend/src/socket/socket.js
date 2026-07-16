import { Server } from 'socket.io';
import { verifyAccessToken } from '../services/jwt.service.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import logger from '../utils/logger.js';

let io = null;

/**
 * Initializes and binds Socket.io logic to the HTTP server.
 * Handles secure authorization handshakes and routes events inside private couple rooms.
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Secure socket handshake authorization using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.token;
      
      if (!token) {
        return next(new Error('Authentication failed, secure token missing.'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication failed, user account not found.'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication handshake failure:', error.message);
      return next(new Error('Authentication failed, token validation error.'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    logger.info(`Socket connected: User ${user.name} <${user.email}>`);

    // Toggle user status to online in database
    user.onlineStatus = 'online';
    await user.save();

    const relationshipId = user.relationshipId ? user.relationshipId.toString() : null;
    
    if (relationshipId) {
      socket.join(relationshipId);
      logger.info(`User ${user.name} automatically joined relationship room: ${relationshipId}`);

      // Broadcast userOnline presence to the couple room
      socket.to(relationshipId).emit('userOnline', {
        userId: user._id,
        onlineStatus: 'online',
      });
    }

    // Event: heartbeat
    socket.on('heartbeat', () => {
      socket.emit('heartbeat', { status: 'ack', timestamp: new Date() });
    });

    // Event: joinRelationshipRoom
    socket.on('joinRelationshipRoom', ({ relationshipId: rId }) => {
      if (!user.relationshipId || user.relationshipId.toString() !== rId) {
        logger.warn(`Unauthorized room join attempt by user ${user._id} to room ${rId}`);
        socket.emit('error', { message: 'Unauthorized room access.' });
        return;
      }
      socket.join(rId);
      logger.info(`User ${user.name} explicitly joined room ${rId}`);
      
      // Let the partner know we are online
      socket.to(rId).emit('userOnline', {
        userId: user._id,
        onlineStatus: 'online',
      });
    });

    // Event: leaveRelationshipRoom
    socket.on('leaveRelationshipRoom', ({ relationshipId: rId }) => {
      socket.leave(rId);
      logger.info(`User ${user.name} left room ${rId}`);
    });

    // Event: sendMessage
    socket.on('sendMessage', async (messageData) => {
      try {
        if (!user.relationshipId || !user.isConnected) {
          socket.emit('error', { message: 'Must be in an active relationship to chat.' });
          return;
        }

        const { type, text, mediaUrl, fileName, mimeType, replyTo } = messageData;
        const receiverId = user.partnerId;

        if (!receiverId) {
          socket.emit('error', { message: 'No partner connected in this relationship.' });
          return;
        }

        const newMessage = await Message.create({
          relationshipId: user.relationshipId,
          sender: user._id,
          receiver: receiverId,
          type: type || 'text',
          text: text || '',
          mediaUrl: mediaUrl || null,
          fileName: fileName || null,
          mimeType: mimeType || null,
          replyTo: replyTo || null,
          deliveredTo: [user._id],
          readBy: [user._id],
        });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar')
          .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name' }
          });

        // Broadcast to both partners in relationship room
        io.to(user.relationshipId.toString()).emit('receiveMessage', populatedMessage);
      } catch (error) {
        logger.error(`Error in sendMessage socket event: ${error.message}`);
        socket.emit('error', { message: 'Failed to send message via socket.' });
      }
    });

    // Event: typingStart
    socket.on('typingStart', () => {
      if (relationshipId) {
        socket.to(relationshipId).emit('typingStart', { userId: user._id });
      }
    });

    // Event: typingStop
    socket.on('typingStop', () => {
      if (relationshipId) {
        socket.to(relationshipId).emit('typingStop', { userId: user._id });
      }
    });

    // Event: messageDelivered
    socket.on('messageDelivered', async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg && !msg.deliveredTo.includes(user._id)) {
          msg.deliveredTo.push(user._id);
          await msg.save();
          if (relationshipId) {
            socket.to(relationshipId).emit('messageDelivered', { messageId, userId: user._id });
          }
        }
      } catch (error) {
        logger.error(`Error in messageDelivered: ${error.message}`);
      }
    });

    // Event: messageSeen
    socket.on('messageSeen', async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg && !msg.readBy.includes(user._id)) {
          msg.readBy.push(user._id);
          if (!msg.deliveredTo.includes(user._id)) {
            msg.deliveredTo.push(user._id);
          }
          await msg.save();
          if (relationshipId) {
            socket.to(relationshipId).emit('messageSeen', { messageId, userId: user._id });
          }
        }
      } catch (error) {
        logger.error(`Error in messageSeen: ${error.message}`);
      }
    });

    // Event: messageReaction
    socket.on('messageReaction', async ({ messageId, emoji }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const existingReactionIndex = msg.reactions.findIndex(
          (r) => r.sender.toString() === user._id.toString()
        );

        if (existingReactionIndex > -1) {
          if (msg.reactions[existingReactionIndex].emoji === emoji) {
            msg.reactions.splice(existingReactionIndex, 1);
          } else {
            msg.reactions[existingReactionIndex].emoji = emoji;
          }
        } else {
          msg.reactions.push({ sender: user._id, emoji });
        }

        await msg.save();
        if (relationshipId) {
          io.to(relationshipId).emit('messageReaction', {
            messageId,
            reactions: msg.reactions,
            userId: user._id
          });
        }
      } catch (error) {
        logger.error(`Error in messageReaction: ${error.message}`);
      }
    });

    // Event: deleteMessage
    socket.on('deleteMessage', async ({ messageId, type }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        if (type === 'everyone') {
          if (msg.sender.toString() !== user._id.toString()) {
            socket.emit('error', { message: 'Unauthorized deletion.' });
            return;
          }
          msg.isDeleted = true;
          msg.text = 'This message was deleted.';
          msg.mediaUrl = null;
          msg.fileName = null;
          msg.mimeType = null;
          await msg.save();

          if (relationshipId) {
            io.to(relationshipId).emit('deleteMessage', { messageId, type: 'everyone', message: msg });
          }
        } else {
          if (!msg.deletedFor) {
            msg.deletedFor = [];
          }
          if (!msg.deletedFor.includes(user._id)) {
            msg.deletedFor.push(user._id);
            await msg.save();
          }
          socket.emit('deleteMessage', { messageId, type: 'me' });
        }
      } catch (error) {
        logger.error(`Error in deleteMessage socket event: ${error.message}`);
      }
    });

    // Event: editMessage
    socket.on('editMessage', async ({ messageId, text }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (msg.sender.toString() !== user._id.toString()) {
          socket.emit('error', { message: 'Unauthorized edit.' });
          return;
        }

        msg.text = text;
        msg.isEdited = true;
        await msg.save();

        const populatedMsg = await Message.findById(messageId)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar')
          .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name' }
          });

        if (relationshipId) {
          io.to(relationshipId).emit('editMessage', populatedMsg);
        }
      } catch (error) {
        logger.error(`Error in editMessage: ${error.message}`);
      }
    });

    // Event: mediaUpload
    socket.on('media_upload', (media) => {
      if (relationshipId) socket.to(relationshipId).emit('media_upload', media);
    });

    // Event: mediaDelete
    socket.on('media_delete', ({ mediaId, type }) => {
      if (relationshipId) socket.to(relationshipId).emit('media_delete', { mediaId, type });
    });

    // Event: mediaDownload
    socket.on('media_download', ({ mediaId, userId }) => {
      if (relationshipId) socket.to(relationshipId).emit('media_download', { mediaId, userId });
    });

    // Event: mediaFavorite
    socket.on('media_favorite', ({ mediaId, isFavorited, userId }) => {
      if (relationshipId) socket.to(relationshipId).emit('media_favorite', { mediaId, isFavorited, userId });
    });

    // Event: mediaSeen
    socket.on('media_seen', ({ mediaId, userId }) => {
      if (relationshipId) socket.to(relationshipId).emit('media_seen', { mediaId, userId });
    });

    // Event: themeChanged — mood theme synchronization
    socket.on('theme_changed', (data) => {
      if (relationshipId) {
        socket.to(relationshipId).emit('theme_changed', {
          theme: data.theme,
          updatedBy: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          },
          updatedAt: new Date(),
        });
      }
    });

    // Event: Disconnection handling
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: User ${user.name} <${user.email}>`);
      
      // Update presence flags and set lastSeen timestamp
      user.onlineStatus = 'offline';
      user.lastSeen = new Date();
      await user.save();

      if (relationshipId) {
        socket.to(relationshipId).emit('userOffline', {
          userId: user._id,
          onlineStatus: 'offline',
          lastSeen: user.lastSeen,
        });
      }
    });
  });

  return io;
};

/**
 * Returns the active Socket.io server instance.
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized.');
  }
  return io;
};

/**
 * Emits an event to all users joined inside a private relationship room.
 */
export const emitToCouple = (relationshipId, event, data) => {
  if (io && relationshipId) {
    io.to(relationshipId.toString()).emit(event, data);
  }
};

/**
 * Emits an event directly to a single user socket.
 */
export const emitToUser = async (userId, event, data) => {
  if (!io) return;
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    if (socket.user && socket.user._id.toString() === userId.toString()) {
      socket.emit(event, data);
    }
  }
};
