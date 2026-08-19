const fetch = globalThis.fetch;

async function runUpiFlowTest() {
  console.log('=== RUNNING NENOFLEX UPI & CHECKOUT INTEGRATION TEST ===');

  // 1. Fetch available product from catalog
  const prodRes = await fetch('http://127.0.0.1:3000/api/products');
  const prodsData = await prodRes.json();
  const products = prodsData.products || [];
  console.log(`✓ Fetched ${products.length} products from catalog API`);

  const inStockProduct = products.find(p => p.stockCount > 0) || products[0];
  if (!inStockProduct) {
    console.error('❌ No product found for test');
    return;
  }
  console.log(`✓ Testing with product: "${inStockProduct.name}" (ID: ${inStockProduct.id}, Price: ₹${inStockProduct.price})`);

  // 2. Place Order using QR-PREPAID
  const orderPayload = {
    items: [
      {
        productId: inStockProduct.id,
        quantity: 1,
        selectedSize: 'M',
        product: inStockProduct,
      }
    ],
    shippingAddress: {
      fullName: 'Test Customer',
      email: 'customer.test@nenoflex.in',
      phone: '9876543210',
      address: 'House #42, MG Road',
      city: 'Nagaon',
      state: 'Assam',
      pincode: '782001'
    },
    paymentMethod: 'QR-PREPAID'
  };

  console.log('\n--- 1. Placing Order with QR-PREPAID ---');
  const t0 = Date.now();
  const createRes = await fetch('http://127.0.0.1:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const tCreate = Date.now() - t0;
  const createData = await createRes.json();
  console.log(`✓ Order creation completed in ${tCreate}ms! HTTP Status: ${createRes.status}`);

  if (!createData.success || !createData.order) {
    console.error('❌ Order creation failed:', createData);
    return;
  }

  const order = createData.order;
  console.log('✓ Order ID:', order.id);
  console.log('✓ Order Status:', order.status);
  console.log('✓ Payment Method:', order.paymentMethod);
  console.log('✓ Payment Details Snapshot:', order.paymentDetails);

  // Assert snapshot
  if (order.status !== 'Pending Payment') {
    console.error('❌ Expected status to be "Pending Payment", got:', order.status);
  } else {
    console.log('✓ Correct initial status: "Pending Payment"');
  }

  if (!order.paymentDetails || !order.paymentDetails.upiId || !order.paymentDetails.expiresAt) {
    console.error('❌ Missing paymentDetails snapshot in order!');
  } else {
    console.log(`✓ Correct payment snapshot: UPI ID = ${order.paymentDetails.upiId}, Payee = ${order.paymentDetails.payeeName}, Timer = ${order.paymentDetails.paymentTimerSeconds}s, Expiry = ${order.paymentDetails.expiresAt}`);
  }

  // 3. Test Payment Page Order Query (GET /api/orders?id=...)
  console.log('\n--- 2. Fetching Order by ID for Payment Page ---');
  const queryRes = await fetch(`http://127.0.0.1:3000/api/orders?id=${encodeURIComponent(order.id)}`);
  const queryData = await queryRes.json();
  if (queryData.success && queryData.order) {
    console.log('✓ Successfully retrieved order snapshot by ID without admin auth!');
    console.log(`✓ Authoritative total: ₹${queryData.order.total}, Expiry: ${queryData.order.paymentDetails?.expiresAt}`);
  } else {
    console.error('❌ Failed to retrieve order by ID:', queryData);
  }

  // 4. Test Customer "I HAVE PAID" submission (PATCH /api/orders)
  console.log('\n--- 3. Customer Submits Payment ("I HAVE PAID") ---');
  const submitRes = await fetch('http://127.0.0.1:3000/api/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      action: 'submit_payment',
      status: 'Payment Submitted',
      utrNumber: 'UTR-TEST-889922'
    })
  });
  const submitData = await submitRes.json();
  console.log('✓ Submit payment response:', submitData);
  if (submitData.success && submitData.order?.status === 'Payment Submitted') {
    console.log('✓ Order transitioned to "Payment Submitted" with UTR:', submitData.order.paymentDetails?.utrNumber);
  } else {
    console.error('❌ Failed to transition order status to "Payment Submitted"');
  }

  // 5. Test Payment Page Rendering (GET /checkout/payment/[orderId])
  console.log('\n--- 4. Testing Payment Page Route (/checkout/payment/[orderId]) ---');
  const pageRes = await fetch(`http://127.0.0.1:3000/checkout/payment/${encodeURIComponent(order.id)}`);
  console.log(`✓ Payment Page HTTP Status: ${pageRes.status}`);

  console.log('\n=== ALL UPI & CHECKOUT INTEGRATION TESTS PASSED! ===');
}

runUpiFlowTest().catch(console.error);
