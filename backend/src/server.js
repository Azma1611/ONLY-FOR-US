import http from 'http';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import configureCloudinary from './config/cloudinary.js';
import { initSocket } from './socket/socket.js';

// 1. Load ENV
console.log('Loading Environment Variables...');
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Initializes all core async services and starts listening on PORT.
 */
const startServer = async () => {
  try {
    // 2. Connect MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();

    // 3. Start Express
    console.log('Initializing Express...');
    const { default: app } = await import('./app.js');
    const server = http.createServer(app);

    // Configure Cloudinary integrations
    configureCloudinary();

    // 4. Initialize Socket.io
    console.log('Initializing Socket.io...');
    initSocket(server);

    // 5. Server Running
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Fatal startup error during server boot:', error.message || error);
    process.exit(1);
  }
};

startServer();
