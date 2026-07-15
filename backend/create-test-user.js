import dotenv from 'dotenv';
import connectDB, { disconnectDB } from './src/database/connection.js';
import User from './src/models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB();
    
    const emailA = 'test@example.com';
    const passwordA = 'Password123!';
    
    // Check if exists
    let user = await User.findOne({ email: emailA });
    if (user) {
      console.log(`User ${emailA} already exists.`);
      // Update password just in case
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(passwordA, salt);
      user.emailVerified = true;
      await user.save();
      console.log('Password reset to Password123!');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordA, salt);
      
      user = await User.create({
        name: 'Test User',
        email: emailA,
        password: hashedPassword,
        username: 'testuser',
        emailVerified: true
      });
      console.log(`Created new test user: ${emailA}`);
    }

    console.log('\n--- CREDENTIALS ---');
    console.log(`Email: ${emailA}`);
    console.log(`Password: ${passwordA}`);
    console.log('-------------------\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

createTestUser();
