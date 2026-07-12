import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getOTPFromLog(email) {
  const logPath = path.join(process.cwd(), 'dev-email-log.txt');
  if (!fs.existsSync(logPath)) {
    throw new Error(`Log file dev-email-log.txt not found at: ${logPath}`);
  }
  const content = fs.readFileSync(logPath, 'utf8');
  
  // Use a global regex to find all verification matches for this specific email
  const regex = new RegExp(`TO:\\s*${email}[\\s\\S]*?Your 6-digit email verification code is:\\s*(\\d{6})`, 'g');
  const matches = [...content.matchAll(regex)];
  
  if (matches.length > 0) {
    // Return the latest matched OTP code
    return matches[matches.length - 1][1];
  }
  
  throw new Error(`Could not extract OTP code for email ${email} from dev-email-log.txt`);
}

async function runTests() {
  console.log('🧪 Starting Phase 3 E2E API pairing tests...');

  const suffix = Math.floor(Math.random() * 1000000);
  const emailA = `test_partner_a_${suffix}@example.com`;
  const emailB = `test_partner_b_${suffix}@example.com`;

  let tokenA = '';
  let tokenB = '';

  // 1. Register User A
  console.log(`\n1. Registering User A (${emailA})...`);
  const regARes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Partner A',
      email: emailA,
      password: 'Password123!',
      username: `usera${suffix}`
    }),
  });
  const regA = await regARes.json();
  if (!regARes.ok) throw new Error(`User A registration failed: ${JSON.stringify(regA)}`);
  console.log('✅ User A Registered.');

  // 2. Register User B
  console.log(`\n2. Registering User B (${emailB})...`);
  const regBRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Partner B',
      email: emailB,
      password: 'Password123!',
      username: `userb${suffix}`
    }),
  });
  const regB = await regBRes.json();
  if (!regBRes.ok) throw new Error(`User B registration failed: ${JSON.stringify(regB)}`);
  console.log('✅ User B Registered.');

  // Wait a moment for files to write
  await delay(1000);

  // 3. Extract and Verify OTP for User A
  console.log('\n3. Extracting and verifying OTP for User A...');
  const otpA = getOTPFromLog(emailA);
  console.log(`🔑 Extracted User A OTP: ${otpA}`);
  const verifyARes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, otp: otpA, purpose: 'verification' }),
  });
  const verifyA = await verifyARes.json();
  if (!verifyARes.ok) throw new Error(`User A OTP verification failed: ${JSON.stringify(verifyA)}`);
  console.log('✅ User A Email verified successfully.');

  // 4. Extract and Verify OTP for User B
  console.log('\n4. Extracting and verifying OTP for User B...');
  const otpB = getOTPFromLog(emailB);
  console.log(`🔑 Extracted User B OTP: ${otpB}`);
  const verifyBRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, otp: otpB, purpose: 'verification' }),
  });
  const verifyB = await verifyBRes.json();
  if (!verifyBRes.ok) throw new Error(`User B OTP verification failed: ${JSON.stringify(verifyB)}`);
  console.log('✅ User B Email verified successfully.');

  // Add 1.5 seconds delay so that the IAT (Issued At) timestamp of the JWT changes,
  // preventing duplicate key collisions in the Session collection on the database.
  console.log('\n⏳ Waiting 1.5 seconds to rotate token issue timestamp...');
  await delay(1500);

  // 5. Log in User A
  console.log('\n5. Logging in User A...');
  const loginARes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password: 'Password123!' }),
  });
  const loginA = await loginARes.json();
  if (!loginARes.ok) throw new Error(`User A login failed: ${JSON.stringify(loginA)}`);
  tokenA = loginA.data.accessToken;
  console.log('✅ User A logged in successfully.');

  // 6. Log in User B
  console.log('\n6. Logging in User B...');
  const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password: 'Password123!' }),
  });
  const loginB = await loginBRes.json();
  if (!loginBRes.ok) throw new Error(`User B login failed: ${JSON.stringify(loginB)}`);
  tokenB = loginB.data.accessToken;
  console.log('✅ User B logged in successfully.');

  // 7. User A generates invite code
  console.log('\n7. User A generating invite code...');
  const inviteRes = await fetch(`${BASE_URL}/partner/create-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
  });
  const inviteData = await inviteRes.json();
  if (!inviteRes.ok) throw new Error(`Generate invite failed: ${JSON.stringify(inviteData)}`);
  const inviteCode = inviteData.data.inviteCode;
  console.log(`✅ Invite generated: ${inviteCode}`);

  // 8. User A fetches own active invite
  console.log('\n8. User A retrieving active invite details...');
  const myInviteRes = await fetch(`${BASE_URL}/partner/my-invite`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const myInviteData = await myInviteRes.json();
  if (!myInviteRes.ok || !myInviteData.data.invite) throw new Error(`My invite failed: ${JSON.stringify(myInviteData)}`);
  console.log(`✅ Active invite retrieved matches: ${myInviteData.data.invite.code}`);

  // 9. User B joins User A's invite code
  console.log(`\n9. User B joining invite code ${inviteCode}...`);
  const joinRes = await fetch(`${BASE_URL}/partner/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    },
    body: JSON.stringify({ code: inviteCode }),
  });
  const joinData = await joinRes.json();
  if (!joinRes.ok) throw new Error(`Join failed: ${JSON.stringify(joinData)}`);
  console.log('✅ Successfully paired relationship!');

  // 10. Verify Connection Status for User A
  console.log('\n10. Checking Connection Status for User A...');
  const statusARes = await fetch(`${BASE_URL}/partner/status`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const statusA = await statusARes.json();
  if (!statusARes.ok || !statusA.data.connected) throw new Error(`Status check A failed: ${JSON.stringify(statusA)}`);
  console.log(`✅ User A connected to: ${statusA.data.partner.email}`);

  // 11. Verify Connection Status for User B
  console.log('\n11. Checking Connection Status for User B...');
  const statusBRes = await fetch(`${BASE_URL}/partner/status`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  const statusB = await statusBRes.json();
  if (!statusBRes.ok || !statusB.data.connected) throw new Error(`Status check B failed: ${JSON.stringify(statusB)}`);
  console.log(`✅ User B connected to: ${statusB.data.partner.email}`);

  // 12. User A disconnects relationship
  console.log('\n12. User A triggering disconnect...');
  const disconnectRes = await fetch(`${BASE_URL}/partner/disconnect`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const disconnectData = await disconnectRes.json();
  if (!disconnectRes.ok) throw new Error(`Disconnect failed: ${JSON.stringify(disconnectData)}`);
  console.log('✅ Disconnection completed.');

  // 13. Verify disconnected status
  console.log('\n13. Checking status post-disconnect...');
  const statusFinalRes = await fetch(`${BASE_URL}/partner/status`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const statusFinal = await statusFinalRes.json();
  if (!statusFinalRes.ok || statusFinal.data.connected) throw new Error(`Final status check failed (should be disconnected): ${JSON.stringify(statusFinal)}`);
  console.log('✅ Final status confirmed: disconnected.');

  console.log('\n 🎉 ALL PHASE 3 BACKEND pairing tests passed successfully!');
}

runTests().catch((err) => {
  console.error('\n❌ Tests failed:', err.message);
  process.exit(1);
});
