import { SupabaseServerService } from '../lib/supabase-server';

async function runConcurrencyTests() {
  console.log('=== NenoFlex Atomic Stock Concurrency Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: 20 Simultaneous Stock Decrement Requests against Stock = 1
  try {
    const productId = 'test-concurrency-item-001';
    const mockProduct = {
      id: productId,
      sku: 'SKU-CONCURRENCY-001',
      barcode: '8909998887771',
      name: 'Concurrency Limited Vintage Jacket',
      brand: 'Nike' as const,
      category: 'Jackets' as const,
      collection: ['Vintage'],
      price: 999,
      showroomPrice: 9999,
      discountPercent: 90,
      conditionScore: 9.8,
      conditionGrade: 'Mint (9.8-10)' as const,
      sizes: ['L'],
      colors: ['Red'],
      material: 'Nylon',
      weight: '500g',
      fit: 'Boxy Fit' as const,
      description: 'Concurrency test product',
      authenticitySeal: true,
      sanitized: true,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985',
      imageHover: 'https://images.unsplash.com/photo-1544441893-675973e31985',
      gallery: [],
      isNewArrival: true,
      isTrending: true,
      isBestSeller: false,
      isLimited: true,
      stockCount: 1, // Only 1 in stock!
      rating: 5.0,
      reviewsCount: 10,
      tags: ['test'],
    };

    // Save initial product with stock = 1
    await SupabaseServerService.saveProduct(mockProduct);

    console.log('Simulating 20 simultaneous order requests for stockCount = 1...');

    // Launch 20 concurrent stock decrement attempts
    const concurrentRequests = Array.from({ length: 20 }, (_, i) => 
      SupabaseServerService.decrementStockAtomic(productId, 1)
    );

    const results = await Promise.all(concurrentRequests);

    const successfulPurchases = results.filter(r => r.success).length;
    const rejectedPurchases = results.filter(r => !r.success).length;

    console.log(`Results: ${successfulPurchases} Succeeded, ${rejectedPurchases} Rejected.`);

    // Verify stock in database after concurrent requests
    const updatedProducts = await SupabaseServerService.fetchProducts();
    const finalProduct = updatedProducts.find(p => p.id === productId);
    const finalStock = finalProduct ? finalProduct.stockCount : -1;

    console.log(`Final Database Stock Count: ${finalStock}`);

    if (successfulPurchases === 1 && rejectedPurchases === 19 && finalStock === 0) {
      console.log('✔ Test 1 PASSED: Exactly 1 purchase succeeded, 19 rejected, final stock = 0 (No Race Condition)');
      passed++;
    } else {
      console.error(`✖ Test 1 FAILED: Expected 1 success & 19 rejected, got ${successfulPurchases} success & ${rejectedPurchases} rejected. Final stock: ${finalStock}`);
      failed++;
    }

    // Cleanup test product
    await SupabaseServerService.deleteProduct(productId);
  } catch (e: any) {
    console.error('✖ Test 1 FAILED with exception:', e.message);
    failed++;
  }

  console.log(`\nConcurrency Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runConcurrencyTests();
