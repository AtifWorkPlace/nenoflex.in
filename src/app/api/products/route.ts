import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

const DB_FILE = path.join(process.cwd(), 'products_db.json');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// Global In-Memory Edge Cache across Serverless Invocations
let globalEdgeProductsStore: Product[] | null = null;

function loadProductsFromDisk(): Product[] {
  if (globalEdgeProductsStore && globalEdgeProductsStore.length > 0) {
    return globalEdgeProductsStore;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalEdgeProductsStore = parsed;
        return parsed;
      }
    }
  } catch (err) {}
  return globalEdgeProductsStore && globalEdgeProductsStore.length > 0 ? globalEdgeProductsStore : INITIAL_PRODUCTS;
}

function saveProductsToDisk(products: Product[]) {
  globalEdgeProductsStore = products;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {}
}

// Global Supabase Database Writer
async function syncProductsWithSupabase(products: Product[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  // 1. Post to Supabase 'products' table
  try {
    const formattedRows = products.map(p => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      brand: p.brand,
      category: p.category,
      collection: p.collection,
      price: p.price,
      showroomPrice: p.showroomPrice,
      discountPercent: p.discountPercent,
      conditionScore: p.conditionScore,
      conditionGrade: p.conditionGrade,
      sizes: p.sizes,
      colors: p.colors,
      material: p.material,
      weight: p.weight,
      fit: p.fit,
      description: p.description,
      authenticitySeal: p.authenticitySeal,
      sanitized: p.sanitized,
      image: p.image,
      imageHover: p.imageHover,
      gallery: p.gallery,
      isNewArrival: p.isNewArrival,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
      isLimited: p.isLimited,
      stockCount: p.stockCount,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      tags: p.tags,
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(formattedRows),
    });
  } catch (e) {}

  // 2. Post full JSON catalog to Supabase 'site_settings' key-value container
  try {
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
  } catch (e) {}
}

// Global Supabase Database Reader
async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  // 1. Try Supabase 'products' table
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {}

  // 2. Try Supabase 'site_settings' global catalog container
  try {
    const resSettings = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.global_products_catalog&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    });
    if (resSettings.ok) {
      const dataSettings = await resSettings.json();
      if (Array.isArray(dataSettings) && dataSettings[0]?.catalog_data && Array.isArray(dataSettings[0].catalog_data)) {
        return dataSettings[0].catalog_data;
      }
    }
  } catch (e) {}

  return null;
}

export async function GET() {
  // First attempt to fetch live cloud catalog from Supabase Database
  const supabaseProds = await fetchProductsFromSupabase();
  if (supabaseProds && supabaseProds.length > 0) {
    globalEdgeProductsStore = supabaseProds;
    saveProductsToDisk(supabaseProds);
    return NextResponse.json({
      success: true,
      products: supabaseProds,
      source: 'supabase_cloud_global'
    });
  }

  // Fallback to edge memory / disk
  const diskProds = loadProductsFromDisk();
  return NextResponse.json({
    success: true,
    products: diskProds,
    source: 'edge_memory'
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, product, products } = payload;
    let currentStore = loadProductsFromDisk();

    if (action === 'set_all' && Array.isArray(products)) {
      currentStore = products;
      globalEdgeProductsStore = currentStore;
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Catalog saved to Supabase Cloud globally', products: currentStore });
    }

    if (action === 'add' && product) {
      currentStore = [product, ...currentStore.filter(p => p.id !== product.id)];
      globalEdgeProductsStore = currentStore;
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product saved to Supabase Cloud globally', products: currentStore });
    }

    if (action === 'update' && product) {
      currentStore = currentStore.map(p => p.id === product.id ? product : p);
      globalEdgeProductsStore = currentStore;
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product updated on Supabase Cloud globally', products: currentStore });
    }

    if (action === 'delete' && product?.id) {
      currentStore = currentStore.filter(p => p.id !== product.id);
      globalEdgeProductsStore = currentStore;
      saveProductsToDisk(currentStore);
      syncProductsWithSupabase(currentStore);
      return NextResponse.json({ success: true, message: 'Product deleted from Supabase Cloud globally', products: currentStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update products store' }, { status: 500 });
  }
}
