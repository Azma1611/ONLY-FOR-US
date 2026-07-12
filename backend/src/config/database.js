import mongoose from 'mongoose';

let mongoServer = null;

/**
 * Establish database connection to MongoDB Atlas.
 */
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error('❌ MONGODB_URI is missing from environment variables!');
    throw new Error('MONGODB_URI is missing from environment variables!');
  }

  // Register listeners only if they are not already registered
  if (mongoose.connection.listeners('disconnected').length === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB connection successfully re-established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });
  }

  try {
    const options = process.env.NODE_ENV === 'production'
      ? {}
      : { serverSelectionTimeoutMS: 5000 };
    await mongoose.connect(dbUri, options);
    console.log('MongoDB Atlas Connected');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ Database connection error: ${error.message}`);
      throw error;
    }

    console.warn('\n=========================================');
    console.warn('⚠️  Could not connect to MongoDB Atlas cluster.');
    console.warn('⚠️  Reason:', error.message);
    console.warn('⚠️  Falling back to local in-memory MongoDB database (mongodb-memory-server)...');
    console.warn('⚠️  Note: Data will be temporary and reset on server restart.');
    console.warn('=========================================\n');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log('✅ Connected to local in-memory MongoDB server successfully.');

      // Auto-seed two pre-paired test accounts in development
      const User = (await import('../models/User.js')).default;
      const Relationship = (await import('../models/Relationship.js')).default;
      
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding initial paired test accounts...');
        const userA = await User.create({
          name: 'Alex',
          email: 'alex@example.com',
          password: 'Password123!',
          username: 'alex',
          emailVerified: true,
          invitationCode: 'ALEX-123',
        });
        const userB = await User.create({
          name: 'Taylor',
          email: 'taylor@example.com',
          password: 'Password123!',
          username: 'taylor',
          emailVerified: true,
          invitationCode: 'TAYLOR-123',
        });
        const relationship = await Relationship.create({
          relationshipName: 'Alex & Taylor Space',
          partnerOne: userA._id,
          partnerTwo: userB._id,
          relationshipStatus: 'active',
          anniversary: new Date('2025-01-01'),
        });
        userA.relationshipId = relationship._id;
        userA.partnerId = userB._id;
        userA.isConnected = true;
        userB.relationshipId = relationship._id;
        userB.partnerId = userA._id;
        userB.isConnected = true;
        await userA.save();
        await userB.save();
        console.log('✅ Seeded accounts: alex@example.com & taylor@example.com (Password: Password123!)');
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback in-memory database failed: ${fallbackError.message}`);
      throw error;
    }
  }
};

/**
 * Disconnects Mongoose connection gracefully.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🔌 In-memory database stopped.');
      mongoServer = null;
    }
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error(`Error shutting down database connections: ${error.message}`);
  }
};

export default connectDB;
// Trigger restart
