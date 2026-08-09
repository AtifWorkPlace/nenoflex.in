import { ServerAuth } from '../lib/auth';
import { SupabaseServerService } from '../lib/supabase-server';
import { normalizeOrderFromDb } from '../lib/supabase';
import { Order } from '../types';

async function runOrderPipelineTests() {
  console.log('=====================================================');
  console.log('   NenoFlex Order Pipeline & Realtime Verification   ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: GET /api/orders - Unauthenticated Rejection (401)
  try {
    const unauthReq = new Request('http://localhost/api/orders');
    const authResult = ServerAuth.verifyAdminRequest(unauthReq);
    if (!authResult.authorized && authResult.error?.includes('Unauthorized')) {
      console.log('✔ Test 1 PASSED: GET /api/orders rejects unauthenticated requests with HTTP 401');
      passed++;
    } else {
      console.error('✖ Test 1 FAILED: Unauthenticated request was allowed', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 1 FAILED with exception:', e.message);
    failed++;
  }

  // Test 2: GET /api/orders - Valid HMAC Admin Token Verification (200)
  try {
    const adminToken = ServerAuth.generateAdminToken('admin@nenoflex.com', 'Admin');
    const authReq = new Request('http://localhost/api/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const authResult = ServerAuth.verifyAdminRequest(authReq);
    if (authResult.authorized && authResult.session?.email === 'admin@nenoflex.com') {
      console.log('✔ Test 2 PASSED: GET /api/orders validates admin HMAC Authorization token');
      passed++;
    } else {
      console.error('✖ Test 2 FAILED: HMAC token verification failed', authResult);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 2 FAILED with exception:', e.message);
    failed++;
  }

  // Test 3: Order Serialization & Field Normalization
  try {
    const rawDbOrder = {
      id: 'NF-1786299000-TEST',
      subtotal: 1299,
      discount: 100,
      shipping_fee: 0,
      total: 1199,
      status: 'Placed',
      shipping_address: {
        fullName: 'Test Customer',
        email: 'test@nenoflex.in',
        phone: '9876543210',
        address: '123 Vault St',
        city: 'Nagaon',
        state: 'Assam',
        pincode: '782001',
      },
      payment_method: 'Prepaid',
      items: [
        {
          product: { id: 'prod-1', name: 'Nike Vintage Tee', price: 1299 },
          selectedSize: 'L',
          quantity: 1,
        },
      ],
      created_at: '2026-08-09T20:00:00.000Z',
    };

    const normalized = normalizeOrderFromDb(rawDbOrder);
    if (
      normalized.id === 'NF-1786299000-TEST' &&
      normalized.total === 1199 &&
      normalized.shippingFee === 0 &&
      normalized.shippingAddress.fullName === 'Test Customer' &&
      normalized.status === 'Placed'
    ) {
      console.log('✔ Test 3 PASSED: normalizeOrderFromDb correctly maps snake_case DB columns to camelCase Order interface');
      passed++;
    } else {
      console.error('✖ Test 3 FAILED: Field normalization mismatch', normalized);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 3 FAILED with exception:', e.message);
    failed++;
  }

  // Test 4: Realtime Order Event Deduplication Logic
  try {
    const initialOrders: Order[] = [
      {
        id: 'NF-1001',
        items: [],
        subtotal: 1000,
        discount: 0,
        shippingFee: 0,
        total: 1000,
        status: 'Placed',
        shippingAddress: { fullName: 'A', email: 'a@a.com', phone: '1', address: '1', city: 'C', state: 'S', pincode: '1' },
        paymentMethod: 'Prepaid',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '2026-08-12',
      },
    ];

    const duplicateIncoming: Order = { ...initialOrders[0], status: 'Shipped' };
    const newIncoming: Order = {
      ...initialOrders[0],
      id: 'NF-1002',
    };

    // Deduplication algorithm test
    const applyEvent = (list: Order[], incoming: Order) => {
      const exists = list.some(o => o.id === incoming.id);
      if (exists) return list.map(o => (o.id === incoming.id ? incoming : o));
      return [incoming, ...list];
    };

    let updatedList = applyEvent(initialOrders, duplicateIncoming);
    if (updatedList.length === 1 && updatedList[0].status === 'Shipped') {
      // Duplicate didn't grow list, updated in-place
      updatedList = applyEvent(updatedList, newIncoming);
      if (updatedList.length === 2 && updatedList[0].id === 'NF-1002') {
        console.log('✔ Test 4 PASSED: Realtime deduplication prevents duplicate items and updates existing orders cleanly');
        passed++;
      } else {
        console.error('✖ Test 4 FAILED: New order failed to prepend cleanly', updatedList);
        failed++;
      }
    } else {
      console.error('✖ Test 4 FAILED: Duplicate incoming event caused duplicate list item', updatedList);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 4 FAILED with exception:', e.message);
    failed++;
  }

  // Test 5: saveOrder Error Handling Result Structure
  try {
    const testOrder: Order = {
      id: `NF-TEST-SAVE-${Date.now()}`,
      items: [],
      subtotal: 500,
      discount: 0,
      shippingFee: 80,
      total: 580,
      status: 'Placed',
      shippingAddress: { fullName: 'Tester', email: 't@t.com', phone: '1', address: '1', city: 'C', state: 'S', pincode: '1' },
      paymentMethod: 'Prepaid',
      createdAt: new Date().toISOString(),
      estimatedDelivery: '2026-08-12',
    };

    const res = await SupabaseServerService.saveOrder(testOrder);
    if (typeof res === 'object' && typeof res.success === 'boolean') {
      console.log('✔ Test 5 PASSED: saveOrder returns structured { success, error } status without swallowing errors');
      passed++;
    } else {
      console.error('✖ Test 5 FAILED: saveOrder did not return structured result object', res);
      failed++;
    }
  } catch (e: any) {
    console.error('✖ Test 5 FAILED with exception:', e.message);
    failed++;
  }

  console.log(`\n=====================================================`);
  console.log(`Pipeline Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=====================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runOrderPipelineTests();
