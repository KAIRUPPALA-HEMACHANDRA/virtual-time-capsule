const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Socket.io Setup
 * 
 * Creates a WebSocket server that runs alongside Express.
 * Clients connect with their JWT token for authentication.
 * Each user gets their own "room" (their userId) so we can
 * send notifications to specific users.
 * 
 * FLOW:
 * 1. Client connects with access token
 * 2. We verify the token and extract userId
 * 3. User joins a room named after their userId
 * 4. When a capsule unlocks, we emit to that room
 * 5. Client receives the event instantly — no polling needed
 */

let io = null;

function initializeSocket(httpServer, clientURL) {
  io = new Server(httpServer, {
    cors: {
      origin: clientURL,
      credentials: true,
    },
  });

  // Authentication middleware — verify JWT before allowing connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join a room specific to this user
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Send notification to a specific user
function emitToUser(userId, event, data) {
  if (io) {
    io.to(userId).emit(event, data);
  }
}

module.exports = { initializeSocket, getIO, emitToUser };
