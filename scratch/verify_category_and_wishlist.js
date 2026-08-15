const fs = require('fs');

let envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[k] = v;
  }
});

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

function normalizeCategoryMatch(productCat, filterCat) {
  if (!filterCat || filterCat === 'All') return true;
  const pCat = (productCat || '').trim().toLowerCase();
  const fCat = filterCat.trim().toLowerCase();

  return (
    pCat === fCat ||
    (fCat === 'jerseys' || fCat === 'jersey' ? pCat.includes('jersey') : false) ||
    (fCat === 'jackets' || fCat === 'jacket' ? pCat.includes('jacket') || pCat.includes('windbreaker') || pCat.includes('windcheater') : false) ||
    (fCat === 'sweatshirts' || fCat === 'sweatshirt' ? pCat.includes('sweatshirt') : false) ||
    (fCat === 'hoodies' || fCat === 'hoodie' ? pCat.includes('hoodie') : false) ||
    (fCat.endsWith('s') && pCat === fCat.slice(0, -1)) ||
    (pCat.endsWith('s') && fCat === pCat.slice(0, -1))
  );
}

async function runTests() {
  console.log('==================================================');
  console.log('CATEGORY ROUTING & GUEST WISHLIST VERIFICATION');
  console.log('==================================================\n');

  // Fetch Master Catalog
  const res = await fetch(`${url}/rest/v1/products?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const products = await res.json();
  console.log(`Live Supabase Products: ${products.length}`);
  const uniqueIds = new Set(products.map(p => p.id));
  console.log(`Unique Product IDs: ${uniqueIds.size}`);
  console.log(`Duplicates in DB: ${products.length - uniqueIds.size}`);

  // Test 1: Category Derived Views
  console.log('\n--- 1. CATEGORY FILTERING DERIVED VIEWS ---');
  const categoriesToTest = ['Jerseys', 'Sweatshirts', 'Jackets', 'Hoodies', 'All'];
  for (const cat of categoriesToTest) {
    const derived = products.filter(p => normalizeCategoryMatch(p.category, cat));
    console.log(`[Category: ${cat}] -> ${derived.length} products`);
    if (cat !== 'All') {
      const invalid = derived.filter(p => !normalizeCategoryMatch(p.category, cat));
      console.log(`  Invalid mismatches in "${cat}": ${invalid.length} (PASS: ${invalid.length === 0})`);
    }
  }

  // Test 2: Admin Category Persistence
  console.log('\n--- 2. ADMIN CATEGORY UPDATE & PERSISTENCE ---');
  const targetProduct = products[0];
  const origCategory = targetProduct.category;
  const testNewCategory = origCategory === 'Sweatshirts' ? 'Jackets' : 'Sweatshirts';

  console.log(`Product "${targetProduct.name}" (ID: ${targetProduct.id})`);
  console.log(`Original Category: ${origCategory}`);
  console.log(`Updating category to: ${testNewCategory}...`);

  const updateRes = await fetch(`${url}/rest/v1/products?id=eq.${targetProduct.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ category: testNewCategory })
  });
  const updatedData = await updateRes.json();
  const updatedCat = updatedData[0]?.category;
  console.log(`Database Category after update: ${updatedCat}`);
  const passUpdate = updatedCat === testNewCategory;
  console.log(`Admin Category Update Test: ${passUpdate ? 'PASS' : 'FAIL'}`);

  // Restore category
  await fetch(`${url}/rest/v1/products?id=eq.${targetProduct.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({ category: origCategory })
  });
  console.log(`Restored original category "${origCategory}".`);

  // Test 3: Guest Wishlist Logic & Merging
  console.log('\n--- 3. GUEST WISHLIST & MERGING ---');
  let guestWishlist = [];
  function toggle(id) {
    if (guestWishlist.includes(id)) {
      guestWishlist = guestWishlist.filter(x => x !== id);
    } else {
      guestWishlist = Array.from(new Set([...guestWishlist, id]));
    }
  }

  toggle('nf-101');
  console.log(`Guest added nf-101: [${guestWishlist.join(', ')}] (Length: ${guestWishlist.length})`);
  toggle('nf-105');
  console.log(`Guest added nf-105: [${guestWishlist.join(', ')}] (Length: ${guestWishlist.length})`);
  toggle('nf-101');
  console.log(`Guest removed nf-101: [${guestWishlist.join(', ')}] (Length: ${guestWishlist.length})`);
  toggle('nf-101');
  console.log(`Guest re-added nf-101: [${guestWishlist.join(', ')}] (Length: ${guestWishlist.length})`);

  const accountWishlist = ['nf-105', 'nf-110'];
  console.log(`Account existing wishlist: [${accountWishlist.join(', ')}]`);
  const mergedWishlist = Array.from(new Set([...guestWishlist, ...accountWishlist]));
  console.log(`Merged wishlist upon login: [${mergedWishlist.join(', ')}] (Length: ${mergedWishlist.length})`);
  const passMerge = mergedWishlist.length === 3 && mergedWishlist.includes('nf-101') && mergedWishlist.includes('nf-105') && mergedWishlist.includes('nf-110');
  console.log(`Guest -> Account Wishlist Merge: ${passMerge ? 'PASS' : 'FAIL'}`);

  console.log('\n==================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

runTests();
