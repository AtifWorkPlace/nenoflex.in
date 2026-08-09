import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

const DB_FILE = path.join(process.cwd(), 'products_db.json');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY || 'sb_publishable_tkznoefVD3i0aQgQe5Le3A_geT00KaP';

// Helper to load products from disk database
function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read products_db.json:', err);
  }
  return INITIAL_PRODUCTS;
}

// Helper to save products to disk database
function saveProductsToDisk(products: Product[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write products_db.json:', err);
  }
}

// Helper to sync product catalog with Supabase PostgreSQL database table
async function syncProductsWithSupabase(products: Product[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(products),
    });
  } catch (err) {
    console.warn('Supabase sync background:', err);
  }
}

async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Supabase fetch products error:', e);
  }
  return null;
}

export async function GET() {
  // First try fetching real-time catalog from Supabase
  const supabaseProds = await fetchProductsFromSupabase();
  if (supabaseProds && supabaseProds.length > 0) {
    saveProductsToDisk(supabaseProds);
    return NextResponse.json({ success: true, products: supabaseProds, source: 'supabase' });
  }

  // Fallback to local disk database
  const diskProds = loadProductsFromDisk();
  return NextResponse.json({ success: true, products: diskProds, source: 'disk' });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, product, products } = payload;
    let currentStore = loadProductsFromDisk();

    if (action === 'set_all' && Array.isArray(products)) {
      currentStore = products;
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Catalog saved to Supabase & disk database', products: currentStore });
    }

    if (action === 'add' && product) {
      currentStore = [product, ...currentStore.filter(p => p.id !== product.id)];
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product saved to Supabase & disk database', products: currentStore });
    }

    if (action === 'update' && product) {
      currentStore = currentStore.map(p => p.id === product.id ? product : p);
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product updated on Supabase & disk database', products: currentStore });
    }

    if (action === 'delete' && product?.id) {
      currentStore = currentStore.filter(p => p.id !== product.id);
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product deleted from Supabase & disk database', products: currentStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update products store' }, { status: 500 });
  }
}
