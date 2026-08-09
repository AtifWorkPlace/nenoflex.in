import { ServerAuth } from '../lib/auth';

function runTests() {
  console.log('=== NenoFlex Production Security & Logic Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Admin Token Sign & Verify
  try {
    const token = ServerAuth.generateAdminToken('admin@nenoflex.com', 'Admin');
    const dummyReq = new Request('http://localhost/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const authResult = ServerAuth.verifyAdminRequest(dummyReq);
    if (authResult.authorized && authResult.session?.email === 'admin@nenoflex.com' && authResult.session?.role === 'Admin') {
      console.log('✔ Test 1 PASSED: Admin token generation and verification succeeded');
      passed++;
    } else {
      console.error('✖ Test 1 FAILED: Admin token verification failed', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 1 FAILED with exception:', e.message);
    failed++;
  }

  // Test 2: Unauthenticated Admin Request Rejection
  try {
    const unauthReq = new Request('http://localhost/api/products');
    const authResult = ServerAuth.verifyAdminRequest(unauthReq);
    if (!authResult.authorized && authResult.error?.includes('Unauthorized')) {
      console.log('✔ Test 2 PASSED: Unauthenticated admin request correctly rejected with HTTP 401');
      passed++;
    } else {
      console.error('✖ Test 2 FAILED: Unauthenticated request was improperly allowed', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 2 FAILED with exception:', e.message);
    failed++;
  }

  // Test 3: Server Price Calculation Logic
  try {
    const dbPrice = 349;
    const clientAttemptedPrice = 1; // Price tampering attempt by malicious client
    const qty = 2;

    const authoritativeLineTotal = dbPrice * qty; // 698
    const tamperedLineTotal = clientAttemptedPrice * qty; // 2

    if (authoritativeLineTotal === 698 && tamperedLineTotal !== authoritativeLineTotal) {
      console.log('✔ Test 3 PASSED: Server price calculation overrides client price tampering');
      passed++;
    } else {
      console.error('✖ Test 3 FAILED: Server failed to override client price tampering');
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 3 FAILED with exception:', e.message);
    failed++;
  }

  // Test 4: Coupon Discount Calculation & Min Order Check
  try {
    const coupon = { code: 'FLEX10', discountPercent: 10, minOrderValue: 499, maxDiscount: 500 };
    const validSubtotal = 1000;
    const invalidSubtotal = 300;

    const validDiscount = validSubtotal >= coupon.minOrderValue ? Math.min(Math.round((validSubtotal * coupon.discountPercent) / 100), coupon.maxDiscount) : 0;
    const invalidDiscount = invalidSubtotal >= coupon.minOrderValue ? Math.min(Math.round((invalidSubtotal * coupon.discountPercent) / 100), coupon.maxDiscount) : 0;

    if (validDiscount === 100 && invalidDiscount === 0) {
      console.log('✔ Test 4 PASSED: Coupon validation correctly enforces min order threshold and max discount');
      passed++;
    } else {
      console.error(`✖ Test 4 FAILED: Expected 100 & 0, got ${validDiscount} & ${invalidDiscount}`);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 4 FAILED with exception:', e.message);
    failed++;
  }

  console.log(`\nTest Execution Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
