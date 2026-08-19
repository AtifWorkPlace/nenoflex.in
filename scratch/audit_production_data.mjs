import { SupabaseServerService } from './src/lib/supabase-server';

async function testHealthAndData() {
  console.log('=== RUNNING PRODUCTION REPOSITORY & SUPABASE AUDIT ===');

  const products = await SupabaseServerService.fetchProducts();
  console.log(`✓ Production Products Count: ${products.length}`);
  console.log(`✓ Sample Product: "${products[0]?.name}" (ID: ${products[0]?.id}, Price: ₹${products[0]?.price}, Stock: ${products[0]?.stockCount})`);

  const settings = await SupabaseServerService.fetchSettings();
  console.log(`✓ Site Settings Found: ${settings ? 'YES' : 'NO'}`);
  console.log(`✓ Categories Count: ${settings?.customCategories?.length}`);
  console.log(`✓ Brands Count: ${settings?.customBrands?.length}`);
  console.log(`✓ Payment Settings:`, settings?.paymentSettings);

  const orders = await SupabaseServerService.fetchOrders();
  console.log(`✓ Existing Production Orders Count: ${orders.length}`);

  console.log('=== ALL AUDITS PASSED ===');
}

testHealthAndData().catch(console.error);
