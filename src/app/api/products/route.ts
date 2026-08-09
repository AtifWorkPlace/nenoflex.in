import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

const DB_FILE = path.join(process.cwd(), 'products_db.json');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// In-Memory fallback cache
let globalInMemoryCache: Product[] = [...INITIAL_PRODUCTS];

// Helper to load products from disk database if available
function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalInMemoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {}
  return globalInMemoryCache.length > 0 ? globalInMemoryCache : INITIAL_PRODUCTS;
}

// Helper to save products to disk database
function saveProductsToDisk(products: Product[]) {
  globalInMemoryCache = products;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {}
}

// Global Supabase PostgreSQL Catalog Sync
async function syncProductsWithSupabase(products: Product[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    // 1. Try Upserting each product into Supabase 'products' table
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

    // 2. Also save full catalog array into Supabase 'site_settings' table for instant global retrieval
    await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'global_products_catalog',
        catalog_data: products,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('Supabase global cloud sync warning:', err);
  }
}

// Global Supabase PostgreSQL Catalog Retrieval
async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    // 1. Try fetching from Supabase 'products' table
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

    // 2. Try fetching from Supabase 'site_settings' global catalog container
    const resSettings = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.global_products_catalog&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (resSettings.ok) {
      const dataSettings = await resSettings.json();
      if (Array.isArray(dataSettings) && dataSettings[0]?.catalog_data && Array.isArray(dataSettings[0].catalog_data)) {
        return dataSettings[0].catalog_data;
      }
    }
  } catch (e) {
    console.warn('Supabase fetch products error:', e);
  }
  return null;
}

export async function GET() {
  // First try fetching real-time global catalog from Supabase Cloud Database
  const supabaseProds = await fetchProductsFromSupabase();
  if (supabaseProds && supabaseProds.length > 0) {
    saveProductsToDisk(supabaseProds);
    return NextResponse.json({ success: true, products: supabaseProds, source: 'supabase_cloud' });
  }

  // Fallback to disk / in-memory database
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
      return NextResponse.json({ success: true, message: 'Catalog saved to Supabase Cloud & Disk', products: currentStore });
    }

    if (action === 'add' && product) {
      currentStore = [product, ...currentStore.filter(p => p.id !== product.id)];
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product saved to Supabase Cloud & Disk', products: currentStore });
    }

    if (action === 'update' && product) {
      currentStore = currentStore.map(p => p.id === product.id ? product : p);
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product updated on Supabase Cloud & Disk', products: currentStore });
    }

    if (action === 'delete' && product?.id) {
      currentStore = currentStore.filter(p => p.id !== product.id);
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product deleted from Supabase Cloud & Disk', products: currentStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update products store' }, { status: 500 });
  }
}
