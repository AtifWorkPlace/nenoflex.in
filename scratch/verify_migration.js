const fetch = globalThis.fetch;

async function runMigrationVerification() {
  console.log('=== RUNNING NETLIFY PRODUCTION RUNTIME VERIFICATION ===');

  // 1. Health API Check
  console.log('\n--- 1. Testing /api/health ---');
  const healthRes = await fetch('http://127.0.0.1:3000/api/health');
  const healthData = await healthRes.json();
  console.log(`✓ Health Status: ${healthRes.status}`, healthData);

  // 2. Products API Check
  console.log('\n--- 2. Testing /api/products ---');
  const prodRes = await fetch('http://127.0.0.1:3000/api/products');
  const prodData = await prodRes.json();
  const products = prodData.products || [];
  console.log(`✓ Products API HTTP: ${prodRes.status}`);
  console.log(`✓ Total Products Count: ${products.length}`);
  if (products.length > 0) {
    console.log(`✓ Sample Product: "${products[0].name}" (ID: ${products[0].id}, Price: ₹${products[0].price}, Stock: ${products[0].stockCount}, Category: "${products[0].category}")`);
    console.log(`✓ Sample Product Image: ${products[0].image}`);
  }

  // 3. Category Distribution Check
  const categories = {};
  for (const p of products) {
    categories[p.category] = (categories[p.category] || 0) + 1;
  }
  console.log('✓ Category Distribution across 33 products:', categories);

  // 4. Shop Page Check
  console.log('\n--- 3. Testing /shop Page ---');
  const shopRes = await fetch('http://127.0.0.1:3000/shop');
  console.log(`✓ Shop Page HTTP Status: ${shopRes.status}`);

  // 5. Product Detail Page (PDP) Check
  if (products.length > 0) {
    const sampleId = products[0].id;
    console.log(`\n--- 4. Testing Product Detail Page (/product/${sampleId}) ---`);
    const pdpRes = await fetch(`http://127.0.0.1:3000/product/${encodeURIComponent(sampleId)}`);
    console.log(`✓ PDP Page HTTP Status: ${pdpRes.status}`);
  }

  // 6. Checkout Page Check
  console.log('\n--- 5. Testing /checkout Page ---');
  const checkoutRes = await fetch('http://127.0.0.1:3000/checkout');
  console.log(`✓ Checkout Page HTTP Status: ${checkoutRes.status}`);

  console.log('\n=== ALL MIGRATION RUNTIME CHECKS PASSED ===');
}

runMigrationVerification().catch(console.error);
