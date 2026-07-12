import { Server } from 'socket.io';
import { verifyAccessToken } from '../services/jwt.service.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

let io = null;

/**
 * Initializes and binds Socket.io logic to the HTTP server.
 * Handles secure authorization handshakes and routes events inside private couple rooms.
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

    // Automatically join the private couple room if relationship is active
    const relationshipId = user.relationshipId ? user.relationshipId.toString() : null;
    
    if (relationshipId) {
      socket.join(relationshipId);
      logger.info(`User ${user.name} joined private relationship room: ${relationshipId}`);

      // Broadcast updated online presence to the couple room
      socket.to(relationshipId).emit('partner_status', {
        userId: user._id,
        onlineStatus: 'online',
      });
    }

    // Event: Live Typing States
    socket.on('typing_start', () => {
      if (relationshipId) {
        socket.to(relationshipId).emit('typing_start', { userId: user._id });
      }
    });

    socket.on('typing_stop', () => {
      if (relationshipId) {
        socket.to(relationshipId).emit('typing_stop', { userId: user._id });
      }
    });

    // Event: Message Read receipts
    socket.on('message_seen', ({ messageId }) => {
      if (relationshipId) {
        socket.to(relationshipId).emit('message_seen', { messageId, userId: user._id });
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
        socket.to(relationshipId).emit('partner_status', {
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
