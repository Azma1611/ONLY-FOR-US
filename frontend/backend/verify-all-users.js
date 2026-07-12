import dotenv from 'dotenv';
import connectDB, { disconnectDB } from './src/config/database.js';
import User from './src/models/User.js';

dotenv.config();

const verifyAll = async () => {
  console.log('Connecting to database...');
  try {
    await connectDB();
    
    console.log('Updating all users to emailVerified = true...');
    const result = await User.updateMany(
      { emailVerified: false },
      { $set: { emailVerified: true } }
    );
    
    console.log(`✅ Success! Marked ${result.modifiedCount} users as verified.`);
    const allUsers = await User.find({}, 'name email emailVerified');
    console.log('\nCurrent User Statuses:');
    console.table(allUsers.map(u => ({ Name: u.name, Email: u.email, Verified: u.emailVerified })));
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

verifyAll();
