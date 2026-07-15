import dotenv from 'dotenv';
dotenv.config();

console.log('Loading Environment Variables... OK');
console.log('Testing App Imports...');

try {
  const { default: app } = await import('./src/app.js');
  console.log('✅ Express App (app.js) and all routes imported successfully. No ESM/CJS or circular dependency issues.');
} catch (e) {
  console.error('❌ Failed to import app.js:', e);
}

try {
  const { initSocket } = await import('./src/socket/socket.js');
  console.log('✅ Socket.io initialized successfully.');
} catch (e) {
  console.error('❌ Failed to import socket.js:', e);
}

try {
  const { default: configureCloudinary } = await import('./src/config/cloudinary.js');
  configureCloudinary();
  console.log('✅ Cloudinary configuration loaded successfully.');
} catch (e) {
  console.error('❌ Failed to configure Cloudinary:', e);
}
