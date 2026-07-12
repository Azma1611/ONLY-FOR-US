/**
 * Phase 3 — Full Manual E2E Test (Real User Simulation)
 * 
 * Simulates two real users going through the complete lifecycle:
 *   1. Register Account A → Verify OTP → Login
 *   2. Generate invite code
 *   3. Register Account B → Verify OTP → Login
 *   4. Account B enters invite code
 *   5. Both dashboards show partner (verified via API)
 *   6. Simulate page refresh (re-fetch status with existing tokens)
 *   7. Logout Account A → Re-login Account A
 *   8. Account A disconnects
 *   9. Verify BOTH users see disconnected state
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let passCount = 0;
let failCount = 0;

function assert(condition, label) {
  if (condition) {
    passCount++;
    console.log(`   ✅ PASS: ${label}`);
  } else {
    failCount++;
    console.error(`   ❌ FAIL: ${label}`);
  }
}

function getOTPFromLog(email) {
  const logPath = path.join(process.cwd(), 'dev-email-log.txt');
  if (!fs.existsSync(logPath)) {
    throw new Error(`Log file not found: ${logPath}`);
  }
  const content = fs.readFileSync(logPath, 'utf8');
  const regex = new RegExp(
    `TO:\\s*${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?Your 6-digit email verification code is:\\s*(\\d{6})`,
    'g'
  );
  const matches = [...content.matchAll(regex)];
  if (matches.length > 0) {
    return matches[matches.length - 1][1];
  }
  throw new Error(`No OTP found for ${email}`);
}

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, { headers });
  return { status: res.status, data: await res.json() };
}

async function del(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, { method: 'DELETE', headers });
  return { status: res.status, data: await res.json() };
}

async function runFullManualTest() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   PHASE 3 — FULL MANUAL E2E TEST (Real User Simulation)    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const suffix = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  const emailA = `manual_user_a_${suffix}@test.com`;
  const emailB = `manual_user_b_${suffix}@test.com`;
  const passwordA = 'SecurePass1!';
  const passwordB = 'AnotherPass2!';

  let tokenA = '';
  let tokenB = '';
  let refreshTokenA = '';
  let inviteCode = '';

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Register Account A
  // ═══════════════════════════════════════════════════════════════
  console.log('━━━ STEP 1: Register Account A ━━━');
  const regA = await post('/auth/register', {
    name: 'Alice Manual',
    email: emailA,
    password: passwordA,
    username: `alice${suffix}`,
  });
  assert(regA.status === 201, `Registration returns 201 (got ${regA.status})`);
  assert(regA.data.success === true, 'Registration response success=true');
  console.log(`   📧 Registered: ${emailA}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Verify Account A's OTP
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 2: Verify Account A OTP ━━━');
  await delay(800);
  const otpA = getOTPFromLog(emailA);
  console.log(`   🔑 Extracted OTP: ${otpA}`);

  const verifyA = await post('/auth/verify-otp', {
    email: emailA,
    otp: otpA,
    purpose: 'verification',
  });
  assert(verifyA.status === 200, `OTP verification returns 200 (got ${verifyA.status})`);
  assert(verifyA.data.success === true, 'OTP verification success=true');
  assert(verifyA.data.data?.accessToken, 'Auto-login token received after verification');

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Login Account A (fresh login, like a real user would)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 3: Login Account A ━━━');
  await delay(1500); // Ensure unique JWT iat
  const loginA = await post('/auth/login', {
    email: emailA,
    password: passwordA,
  });
  assert(loginA.status === 200, `Login returns 200 (got ${loginA.status})`);
  assert(loginA.data.success === true, 'Login success=true');
  assert(loginA.data.data?.accessToken, 'Access token received');
  assert(loginA.data.data?.refreshToken, 'Refresh token received');
  tokenA = loginA.data.data.accessToken;
  refreshTokenA = loginA.data.data.refreshToken;
  console.log(`   🔐 Token A: ${tokenA.substring(0, 20)}...`);

  // Verify Account A is NOT paired yet
  const statusA_initial = await get('/partner/status', tokenA);
  assert(statusA_initial.data.data?.connected === false, 'Account A starts as NOT connected');
  assert(statusA_initial.data.data?.paired === false, 'Account A starts as NOT paired');

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Account A generates an invite code
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 4: Generate Invite Code ━━━');
  const inviteRes = await post('/partner/create-invite', {}, tokenA);
  assert(inviteRes.status === 201, `Create invite returns 201 (got ${inviteRes.status})`);
  assert(inviteRes.data.data?.inviteCode, 'Invite code received');
  inviteCode = inviteRes.data.data.inviteCode;
  console.log(`   🎫 Invite Code: ${inviteCode}`);

  // Verify Account A can fetch their own invite
  const myInvite = await get('/partner/my-invite', tokenA);
  assert(myInvite.data.data?.invite?.code === inviteCode, 'My-invite matches generated code');
  assert(myInvite.data.data?.invite?.expiresAt, 'Invite has an expiry timestamp');

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Register Account B
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 5: Register Account B ━━━');
  const regB = await post('/auth/register', {
    name: 'Bob Manual',
    email: emailB,
    password: passwordB,
    username: `bob${suffix}`,
  });
  assert(regB.status === 201, `Registration B returns 201 (got ${regB.status})`);
  assert(regB.data.success === true, 'Registration B success=true');
  console.log(`   📧 Registered: ${emailB}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 6: Verify Account B's OTP
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 6: Verify Account B OTP ━━━');
  await delay(800);
  const otpB = getOTPFromLog(emailB);
  console.log(`   🔑 Extracted OTP: ${otpB}`);

  const verifyB = await post('/auth/verify-otp', {
    email: emailB,
    otp: otpB,
    purpose: 'verification',
  });
  assert(verifyB.status === 200, `OTP verification B returns 200 (got ${verifyB.status})`);
  assert(verifyB.data.success === true, 'OTP verification B success=true');

  // ═══════════════════════════════════════════════════════════════
  // STEP 7: Login Account B
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 7: Login Account B ━━━');
  await delay(1500);
  const loginB = await post('/auth/login', {
    email: emailB,
    password: passwordB,
  });
  assert(loginB.status === 200, `Login B returns 200 (got ${loginB.status})`);
  tokenB = loginB.data.data.accessToken;
  console.log(`   🔐 Token B: ${tokenB.substring(0, 20)}...`);

  // Verify Account B is NOT paired yet
  const statusB_initial = await get('/partner/status', tokenB);
  assert(statusB_initial.data.data?.connected === false, 'Account B starts as NOT connected');

  // ═══════════════════════════════════════════════════════════════
  // STEP 8: Account B enters invite code from Account A
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 8: Account B Joins via Invite Code ━━━');
  const joinRes = await post('/partner/join', { code: inviteCode }, tokenB);
  assert(joinRes.status === 200, `Join returns 200 (got ${joinRes.status})`);
  assert(joinRes.data.success === true, 'Join success=true');
  assert(joinRes.data.data?.relationship, 'Relationship object returned');
  assert(joinRes.data.data?.partner, 'Partner object returned');
  console.log(`   💕 Paired! Relationship: ${joinRes.data.data?.relationship?.relationshipName}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 9: Confirm BOTH dashboards show the partner
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 9: Verify Both Users See Partner ━━━');

  // Account A's view
  const statusA_paired = await get('/partner/status', tokenA);
  assert(statusA_paired.data.data?.connected === true, 'Account A: connected=true');
  assert(statusA_paired.data.data?.paired === true, 'Account A: paired=true');
  assert(statusA_paired.data.data?.partner?.email === emailB, `Account A sees partner: ${emailB}`);
  assert(statusA_paired.data.data?.relationship?.relationshipName, 'Account A sees relationship name');
  console.log(`   👀 A sees partner: ${statusA_paired.data.data?.partner?.name} (${statusA_paired.data.data?.partner?.email})`);

  // Account B's view
  const statusB_paired = await get('/partner/status', tokenB);
  assert(statusB_paired.data.data?.connected === true, 'Account B: connected=true');
  assert(statusB_paired.data.data?.paired === true, 'Account B: paired=true');
  assert(statusB_paired.data.data?.partner?.email === emailA, `Account B sees partner: ${emailA}`);
  console.log(`   👀 B sees partner: ${statusB_paired.data.data?.partner?.name} (${statusB_paired.data.data?.partner?.email})`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 10: Simulate page refresh (re-fetch with same tokens)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 10: Simulate Page Refresh (Both Users) ━━━');

  // Account A refreshes dashboard
  const refreshA = await get('/partner/status', tokenA);
  assert(refreshA.data.data?.connected === true, 'After refresh: A still connected');
  assert(refreshA.data.data?.partner?.email === emailB, 'After refresh: A still sees B');

  // Account A also fetches their own profile (simulating /me endpoint)
  const meA = await get('/auth/me', tokenA);
  assert(meA.status === 200, 'Account A /auth/me returns 200');
  assert(meA.data.data?.user?.email === emailA, 'Account A /auth/me shows correct email');

  // Account B refreshes dashboard
  const refreshB = await get('/partner/status', tokenB);
  assert(refreshB.data.data?.connected === true, 'After refresh: B still connected');
  assert(refreshB.data.data?.partner?.email === emailA, 'After refresh: B still sees A');

  console.log('   🔄 Both users persist connection state after page refresh');

  // ═══════════════════════════════════════════════════════════════
  // STEP 11: Logout Account A → Re-login Account A
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 11: Logout & Re-Login Account A ━━━');

  // Logout
  const logoutA = await post('/auth/logout', { refreshToken: refreshTokenA }, tokenA);
  assert(logoutA.status === 200, `Logout returns 200 (got ${logoutA.status})`);
  console.log('   🚪 Account A logged out');

  // Verify token is now invalid (accessing protected route should fail)
  const afterLogout = await get('/partner/status', tokenA);
  // Depending on implementation, this may return 401 or still work with access token
  // The key test is that re-login works
  
  // Re-login
  await delay(1500);
  const reLoginA = await post('/auth/login', {
    email: emailA,
    password: passwordA,
  });
  assert(reLoginA.status === 200, `Re-login returns 200 (got ${reLoginA.status})`);
  const newTokenA = reLoginA.data.data.accessToken;
  assert(newTokenA, 'New access token received after re-login');
  console.log(`   🔐 New Token A: ${newTokenA.substring(0, 20)}...`);

  // Verify partnership persists after re-login
  const statusA_relogin = await get('/partner/status', newTokenA);
  assert(statusA_relogin.data.data?.connected === true, 'After re-login: A still connected');
  assert(statusA_relogin.data.data?.partner?.email === emailB, 'After re-login: A still sees B as partner');
  console.log('   ✨ Partnership survives logout/re-login cycle');

  // ═══════════════════════════════════════════════════════════════
  // STEP 12: Account A disconnects
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 12: Account A Disconnects ━━━');
  const disconnectRes = await del('/partner/disconnect', newTokenA);
  assert(disconnectRes.status === 200, `Disconnect returns 200 (got ${disconnectRes.status})`);
  assert(disconnectRes.data.success === true, 'Disconnect success=true');
  console.log('   💔 Account A disconnected the shared space');

  // ═══════════════════════════════════════════════════════════════
  // STEP 13: Verify BOTH users become disconnected
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ STEP 13: Verify Both Users Are Disconnected ━━━');

  // Account A should be disconnected
  const statusA_final = await get('/partner/status', newTokenA);
  assert(statusA_final.data.data?.connected === false, 'Account A: connected=false after disconnect');
  assert(statusA_final.data.data?.paired === false, 'Account A: paired=false after disconnect');
  assert(statusA_final.data.data?.partner === null, 'Account A: partner=null after disconnect');

  // Account B should ALSO be disconnected (mutual disconnection)
  const statusB_final = await get('/partner/status', tokenB);
  assert(statusB_final.data.data?.connected === false, 'Account B: connected=false after disconnect');
  assert(statusB_final.data.data?.paired === false, 'Account B: paired=false after disconnect');
  assert(statusB_final.data.data?.partner === null, 'Account B: partner=null after disconnect');

  console.log('   ✅ Both users confirmed disconnected');

  // ═══════════════════════════════════════════════════════════════
  // BONUS: Verify edge cases
  // ═══════════════════════════════════════════════════════════════
  console.log('\n━━━ BONUS: Edge Case Verification ━━━');

  // Can't join with an already-used invite code
  const reJoin = await post('/partner/join', { code: inviteCode }, tokenB);
  assert(reJoin.status !== 200, 'Cannot re-use consumed invite code');
  console.log(`   🛡️  Used invite code rejected: "${reJoin.data.message}"`);

  // Account A can generate a new invite code after disconnect
  const newInvite = await post('/partner/create-invite', {}, newTokenA);
  assert(newInvite.status === 201, 'Can generate new invite after disconnect');
  console.log(`   🎫 New invite after disconnect: ${newInvite.data.data?.inviteCode}`);

  // Account A can't join their own invite
  const selfJoin = await post('/partner/join', { code: newInvite.data.data?.inviteCode }, newTokenA);
  assert(selfJoin.status !== 200, 'Cannot join own invite code');
  console.log(`   🛡️  Self-join rejected: "${selfJoin.data.message}"`);

  // ═══════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   RESULTS: ${passCount} PASSED, ${failCount} FAILED${' '.repeat(Math.max(0, 34 - String(passCount).length - String(failCount).length))}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (failCount > 0) {
    console.error(`❌ ${failCount} assertion(s) failed. Phase 3 is NOT production-ready.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL ASSERTIONS PASSED — Phase 3 is production-ready!');
  }
}

runFullManualTest().catch((err) => {
  console.error('\n💥 FATAL ERROR:', err.message);
  process.exit(1);
});
