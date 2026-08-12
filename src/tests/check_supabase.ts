import { SupabaseServerService } from '../lib/supabase-server';

async function checkSupabaseState() {
  console.log('=== INSPECTING SUPABASE CLOUD STATE ===');
  try {
    const products = await SupabaseServerService.fetchProducts();
    console.log(`Products in Supabase Cloud (${products.length}):`);
    products.forEach(p => {
      console.log(`- ID: ${p.id} | Name: ${p.name} | Price: ₹${p.price} | Image len: ${p.image.length}`);
      if (p.image.startsWith('data:')) {
        console.log(`  ⚠️ WARNING: Product ${p.id} image is a BASE64 string of length ${p.image.length}!`);
      }
    });

    const orders = await SupabaseServerService.fetchOrders();
    console.log(`\nOrders in Supabase Cloud: ${orders.length}`);

    const settings = await SupabaseServerService.fetchSettings();
    console.log(`\nSettings in Supabase Cloud: ${settings ? 'EXISTS' : 'NULL'}`);
  } catch (e: any) {
    console.error('Error inspecting Supabase:', e.message);
  }
}

checkSupabaseState();
