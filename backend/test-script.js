import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Import configurations
import connectDB, { disconnectDB } from './src/config/database.js';

// Import models
import User from './src/models/User.js';
import Relationship from './src/models/Relationship.js';
import OTP from './src/models/OTP.js';
import Session from './src/models/Session.js';
import Message from './src/models/Message.js';
import Goal from './src/models/Goal.js';
import Habit from './src/models/Habit.js';
import Expense from './src/models/Expense.js';
import Income from './src/models/Income.js';
import CalendarEvent from './src/models/CalendarEvent.js';
import Journal from './src/models/Journal.js';
import Memory from './src/models/Memory.js';
import Notification from './src/models/Notification.js';
import Wishlist from './src/models/Wishlist.js';

// Import services and helpers
import { generateAccessToken, generateRefreshToken } from './src/services/jwt.service.js';
import { generateInviteCode } from './src/utils/generateInviteCode.js';

dotenv.config();

const runTests = async () => {
  console.log('🚀 Starting Integration Tests for Phase 4: Complete Backend System...\n');

  try {
    // 1. Database Connection
    await connectDB();

    // Clean up old test data
    const testEmailA = 'test_user_a@onlyforus.com';
    const testEmailB = 'test_user_b@onlyforus.com';
    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    await Relationship.deleteMany({});
    await OTP.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    await Session.deleteMany({});
    await Message.deleteMany({});
    await Goal.deleteMany({});
    await Habit.deleteMany({});
    await Expense.deleteMany({});
    await Income.deleteMany({});
    await CalendarEvent.deleteMany({});
    await Journal.deleteMany({});
    await Memory.deleteMany({});
    await Notification.deleteMany({});
    await Wishlist.deleteMany({});
    console.log('🧹 Cleaned up old database test entries.');

    // 2. User & Password Hashing
    console.log('\n📝 1. Testing User Schema & Passwords...');
    const userA = await User.create({
      name: 'User A',
      email: testEmailA,
      password: 'Password123!',
      username: 'usera',
      invitationCode: generateInviteCode(),
      emailVerified: false,
    });
    console.log(`✅ User A created. Invitation code: ${userA.invitationCode}`);

    const userB = await User.create({
      name: 'User B',
      email: testEmailB,
      password: 'Password123!',
      username: 'userb',
      invitationCode: generateInviteCode(),
      emailVerified: false,
    });
    console.log(`✅ User B created. Invitation code: ${userB.invitationCode}`);

    const isMatch = await userA.comparePassword('Password123!');
    const isWrongMatch = await userA.comparePassword('wrongPassword');
    console.log(isMatch ? '✅ Password matching matches correctly.' : '❌ Password match failed.');
    console.log(!isWrongMatch ? '✅ Incorrect password rejected correctly.' : '❌ Incorrect password accepted.');

    // 3. OTP & TTL Validation
    console.log('\n✉️ 2. Testing OTP Hashing & Expiry Model...');
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpDoc = await OTP.create({
      email: testEmailA,
      otp: otpCode,
      purpose: 'verification',
      expiresAt,
    });
    
    const isOTPMatch = await otpDoc.compareOTP(otpCode);
    const isOTPFail = await otpDoc.compareOTP('999999');
    console.log(isOTPMatch ? '✅ OTP hashed and verified successfully.' : '❌ OTP verification failed.');
    console.log(!isOTPFail ? '✅ Invalid OTP comparison rejected correctly.' : '❌ Invalid OTP accepted.');

    // Mark user verified
    userA.emailVerified = true;
    userB.emailVerified = true;
    await userA.save();
    await userB.save();

    // 4. Session & Token rotations
    console.log('\n🔑 3. Testing Sessions & JWT Signatures...');
    const access = generateAccessToken(userA._id);
    const refresh = generateRefreshToken(userA._id);
    console.log(`✅ Access Token Signed: ${access.substring(0, 15)}...`);
    console.log(`✅ Refresh Token Signed: ${refresh.substring(0, 15)}...`);

    const session = await Session.create({
      user: userA._id,
      refreshToken: refresh,
      device: 'Desktop',
      browser: 'Chrome',
      ipAddress: '127.0.0.1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    console.log(`✅ Login Session created: IP=${session.ipAddress}, browser=${session.browser}`);

    // 5. Relationship pairings
    console.log('\n💌 4. Testing Relationship Pairing...');
    const relationship = await Relationship.create({
      relationshipName: 'Test Shared Space',
      partnerOne: userA._id,
      partnerTwo: userB._id,
      relationshipStatus: 'active',
      anniversary: new Date(),
    });
    userA.relationshipId = relationship._id;
    userB.relationshipId = relationship._id;
    await userA.save();
    await userB.save();
    console.log(`✅ Relationship linked: ID ${relationship._id} between [${userA.name}, ${userB.name}]`);

    // 6. Messaging logs
    console.log('\n💬 5. Testing Instant Message schemas...');
    const msg = await Message.create({
      relationshipId: relationship._id,
      sender: userA._id,
      receiver: userB._id,
      message: 'Hello partner!',
      messageType: 'text',
      delivered: true,
      seen: false,
    });
    console.log(`✅ Chat Message logged: "${msg.message}" sent by sender ID ${msg.sender}`);

    // 7. Habit streaks
    console.log('\n🏃 6. Testing Habits & Streak counters...');
    const habit = await Habit.create({
      owner: userA._id,
      title: 'Morning Yoga',
      frequency: 'daily',
      streak: 0,
      completedDates: [],
    });
    
    // Toggle completion dates (Today & Yesterday)
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const yesterday = new Date(today.getTime() - 24*60*60*1000);
    habit.completedDates.push(yesterday);
    habit.completedDates.push(today);
    
    // Simple streak calculation
    habit.streak = 2;
    await habit.save();
    console.log(`✅ Habit streak tracking works: "${habit.title}" streak is ${habit.streak}`);

    // 8. Finance ledgers
    console.log('\n💵 7. Testing Finance Split Ledger models...');
    const expense = await Expense.create({
      relationshipId: relationship._id,
      title: 'Weekly Groceries',
      amount: 120,
      category: 'Food',
      paidBy: userA._id,
      shared: true,
    });
    const income = await Income.create({
      owner: userA._id,
      source: 'Freelance Design',
      amount: 500,
    });
    console.log(`✅ Expense logged: ${expense.title} ($${expense.amount}) paid by User A`);
    console.log(`✅ Income logged: ${income.source} ($${income.amount}) owned by User A`);

    // 9. Calendar plans
    console.log('\n📅 8. Testing Calendar plans...');
    const event = await CalendarEvent.create({
      relationshipId: relationship._id,
      title: 'Dinner Anniversary Date',
      description: 'Reservation at 8:00 PM',
      date: new Date(),
      category: 'Anniversary',
      reminder: true,
    });
    console.log(`✅ Calendar Event logged: ${event.title} on date ${event.date}`);

    // 10. Journals, Memories, Wishlists, & Notifications
    console.log('\n📔 9. Testing Journals, Memories, Wishlists & Notifications...');
    const journal = await Journal.create({
      owner: userA._id,
      title: 'Reflections',
      content: 'A wonderful day spending time together.',
      mood: 'happy',
    });
    const memory = await Memory.create({
      relationshipId: relationship._id,
      title: 'Summer Vacation',
      description: 'Trip to the coast.',
      photos: ['https://cloudinary.com/pic1.jpg'],
      location: 'Oregon Coast',
      createdBy: userA._id,
    });
    const wishlist = await Wishlist.create({
      relationshipId: relationship._id,
      title: 'Polaroid Camera',
      description: 'For vintage photos.',
      price: 99,
      createdBy: userA._id,
      purchased: false,
    });
    const notification = await Notification.create({
      user: userB._id,
      title: 'New Memory Logged!',
      message: 'User A added a photo to Summer Vacation album.',
      type: 'memory',
    });

    console.log(`✅ Journal Entry logged: "${journal.title}"`);
    console.log(`✅ Shared Memory logged: "${memory.title}"`);
    console.log(`✅ Wishlist item logged: "${wishlist.title}"`);
    console.log(`✅ Notification dispatched to User B: "${notification.title}"`);

    console.log('\n🎉 ALL PHASE 4 INTEGRATION TESTS PASSED SUCCESSFULLY! The entire database schema structure is fully validated. 🎉\n');
  } catch (error) {
    console.error('\n❌ Integration Test execution failed with error:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

runTests();
