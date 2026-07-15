import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';
import { dbConfig } from './config.js';

const resolveSrv = promisify(dns.resolveSrv);
const resolve4 = promisify(dns.resolve4);

/**
 * Advanced error parser that translates raw Mongoose/Node connection errors 
 * into exact human-readable root causes.
 */
const parseExactError = (err) => {
  const msg = err.message || '';
  
  if (msg.includes('alert number 80')) {
    return 'Current IP not whitelisted. Atlas is blocking the TLS handshake. Check Network Access in Atlas.';
  }
  if (msg.includes('querySrv') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
    if (msg.includes('querySrv')) return 'DNS SRV failure. Cannot resolve MongoDB Atlas cluster hostname.';
    return 'DNS failure or Firewall blocked the connection (ECONNREFUSED / ENOTFOUND).';
  }
  if (msg.includes('Authentication failed') || msg.includes('bad auth')) {
    return 'Authentication failed. Wrong username or password.';
  }
  if (msg.includes('certificate has expired') || msg.includes('self signed certificate')) {
    return 'Invalid certificate / TLS failure. Local antivirus or network intercepting SSL.';
  }
  if (msg.includes('network timeout') || msg.includes('ETIMEDOUT')) {
    return 'Network timeout. Your connection dropped or firewall is silently dropping packets.';
  }
  if (msg.includes('Cluster paused')) {
    return 'Cluster paused. Please resume your MongoDB Atlas cluster in the dashboard.';
  }
  
  return msg;
};

/**
 * Diagnostic pre-checks
 */
const runDiagnostics = async (dbUri) => {
  console.log('\n=========================================');
  console.log('🔍 MongoDB Connection Diagnostics');
  console.log('=========================================');
  console.log(`- Detected Node version: ${process.version}`);
  console.log(`- Detected Mongoose version: ${mongoose.version}`);
  console.log(`- Detected OpenSSL version: ${process.versions.openssl}`);
  
  process.stdout.write('- Testing Internet... ');
  try {
    await resolve4('google.com');
    console.log('OK');
  } catch {
    console.log('FAILED (No internet connection)');
  }

  process.stdout.write('- Testing DNS SRV... ');
  try {
    const url = new URL(dbUri);
    if (url.protocol === 'mongodb+srv:') {
      await resolveSrv(`_mongodb._tcp.${url.hostname}`);
      console.log('OK');
    } else {
      console.log('SKIPPED (Not using SRV protocol)');
    }
  } catch (err) {
    console.log(`FAILED (${err.message})`);
  }
  
  console.log('- Testing Atlas Reachability... Attempting MongoDB connection...');
  console.log('=========================================\n');
};

/**
 * Establish database connection using robust strategies.
 */
const connectDB = async () => {
  const dbUri = dbConfig.mongodb.uri;

  if (!dbUri) {
    console.error('❌ MONGODB_URI is missing from environment variables!');
    process.exit(1);
  }

  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.removeAllListeners('reconnected');
  mongoose.connection.removeAllListeners('error');

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB connection successfully re-established.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  await runDiagnostics(dbUri);

  console.log('🔄 Attempting MongoDB connection...');
  try {
    await mongoose.connect(dbUri, dbConfig.mongodb.options);
    console.log('✅ Connected successfully to MongoDB Atlas');
  } catch (err) {
    console.log('\n❌ =========================================');
    console.log('❌ MongoDB CONNECTION FAILED');
    console.log('❌ =========================================');
    console.log(`❌ EXACT FAILURE REASON: \n${parseExactError(err)}`);
    console.log('\nPlease resolve the Atlas error above to continue.');
    process.exit(1);
  }
};

/**
 * Disconnects Mongoose connection gracefully.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error(`Error shutting down database connections: ${error.message}`);
  }
};

export default connectDB;
