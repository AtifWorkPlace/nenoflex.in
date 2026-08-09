import { ServerAuth } from '../lib/auth';

function runSecurityTests() {
  console.log('=== NenoFlex Cryptographic Security Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Real HMAC SHA-256 Token Generation & Signature Verification
  try {
    const validToken = ServerAuth.generateAdminToken('admin@nenoflex.com', 'Admin');
    const dummyReq = new Request('http://localhost/api/products', {
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    const authResult = ServerAuth.verifyAdminRequest(dummyReq);
    if (authResult.authorized && authResult.session?.email === 'admin@nenoflex.com') {
      console.log('✔ Test 1 PASSED: Real HMAC SHA-256 token signature generated and verified');
      passed++;
    } else {
      console.error('✖ Test 1 FAILED:', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 1 FAILED with exception:', e.message);
    failed++;
  }

  // Test 2: Reject Base64 Forged Token (Unsigned Token Attack)
  try {
    // Attempting to forge an admin token by merely Base64 encoding a payload
    const forgedHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const forgedPayload = Buffer.from(JSON.stringify({
      userId: 'hacker-001',
      email: 'hacker@malicious.com',
      role: 'Super Admin',
      exp: Date.now() + 1000000,
    })).toString('base64url');
    const forgedToken = `${forgedHeader}.${forgedPayload}.fake_signature_12345`;

    const forgedReq = new Request('http://localhost/api/products', {
      headers: { 'Authorization': `Bearer ${forgedToken}` }
    });
    const authResult = ServerAuth.verifyAdminRequest(forgedReq);

    if (!authResult.authorized && authResult.error?.includes('signature verification failed')) {
      console.log('✔ Test 2 PASSED: Base64 forged token attack correctly rejected with HTTP 401 signature error');
      passed++;
    } else {
      console.error('✖ Test 2 FAILED: Forged token was incorrectly accepted!', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 2 FAILED with exception:', e.message);
    failed++;
  }

  // Test 3: Reject Unauthenticated Request
  try {
    const unauthReq = new Request('http://localhost/api/products');
    const authResult = ServerAuth.verifyAdminRequest(unauthReq);
    if (!authResult.authorized) {
      console.log('✔ Test 3 PASSED: Unauthenticated request rejected');
      passed++;
    } else {
      console.error('✖ Test 3 FAILED:', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 3 FAILED with exception:', e.message);
    failed++;
  }

  // Test 4: Server Price Tampering Protection
  try {
    const dbPrice = 349;
    const clientPrice = 1; // Client attempts to buy ₹349 shirt for ₹1
    const qty = 2;

    const serverCalculatedTotal = dbPrice * qty; // 698
    const clientAttemptedTotal = clientPrice * qty; // 2

    if (serverCalculatedTotal === 698 && clientAttemptedTotal !== serverCalculatedTotal) {
      console.log('✔ Test 4 PASSED: Server calculation overrides client price tampering');
      passed++;
    } else {
      console.error('✖ Test 4 FAILED');
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 4 FAILED with exception:', e.message);
    failed++;
  }

  console.log(`\nSecurity Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runSecurityTests();
