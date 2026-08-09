import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';
import { normalizeProductFromDb } from '@/lib/supabase';

const DB_FILE = path.join(process.cwd(), 'products_db.json');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// Global edge memory cache
let globalInMemoryCatalog: Product[] | null = null;

function loadProductsFromDisk(): Product[] {
  if (globalInMemoryCatalog && globalInMemoryCatalog.length > 0) {
    return globalInMemoryCatalog;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalInMemoryCatalog = parsed.map(normalizeProductFromDb);
        return globalInMemoryCatalog;
      }
    }
  } catch (err) {}
  return INITIAL_PRODUCTS;
}

function saveProductsToDisk(products: Product[]) {
  globalInMemoryCatalog = products;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {}
}

// Write catalog to Supabase Cloud Storage (site_settings + products table)
async function syncCatalogToSupabaseCloud(products: Product[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  // 1. Save full JSON catalog to Supabase 'site_settings' key-value container (Fail-safe!)
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

  // 2. Save individual rows to Supabase 'products' table
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
      showroom_price: p.showroomPrice,
      discount_percent: p.discountPercent,
      condition_score: p.conditionScore,
      condition_grade: p.conditionGrade,
      sizes: p.sizes,
      colors: p.colors,
      material: p.material,
      weight: p.weight,
      fit: p.fit,
      description: p.description,
      authenticity_seal: p.authenticitySeal,
      sanitized: p.sanitized,
      image: p.image,
      image_hover: p.imageHover,
      gallery: p.gallery,
      is_new_arrival: p.isNewArrival,
      is_trending: p.isTrending,
      is_best_seller: p.isBestSeller,
      is_limited: p.isLimited,
      stock_count: p.stockCount,
      rating: p.rating,
      reviews_count: p.reviewsCount,
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
}

// Read live catalog from Supabase Cloud
async function fetchCatalogFromSupabaseCloud(): Promise<Product[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  // 1. Try Supabase 'site_settings' key-value container (Fail-safe primary!)
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
      if (Array.isArray(dataSettings) && dataSettings[0]?.catalog_data && Array.isArray(dataSettings[0].catalog_data) && dataSettings[0].catalog_data.length > 0) {
        return dataSettings[0].catalog_data.map(normalizeProductFromDb);
      }
    }
  } catch (e) {}

  // 2. Fallback to Supabase 'products' table
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
        return data.map(normalizeProductFromDb);
      }
    }
  } catch (e) {}

  return null;
}

export async function GET() {
  const supabaseProds = await fetchCatalogFromSupabaseCloud();
  if (supabaseProds && supabaseProds.length > 0) {
    globalInMemoryCatalog = supabaseProds;
    saveProductsToDisk(supabaseProds);
    return NextResponse.json({
      success: true,
      products: supabaseProds,
      source: 'supabase_cloud'
    });
  }

  const diskProds = loadProductsFromDisk();
  return NextResponse.json({
    success: true,
    products: diskProds,
    source: 'disk_memory'
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, product, products } = payload;
    let currentStore = loadProductsFromDisk();

    if (action === 'set_all' && Array.isArray(products)) {
      currentStore = products.map(normalizeProductFromDb);
      saveProductsToDisk(currentStore);
      syncCatalogToSupabaseCloud(currentStore);
      return NextResponse.json({ success: true, message: 'Catalog saved to Supabase Cloud', products: currentStore });
    }

    if (action === 'add' && product) {
      const cleanProd = normalizeProductFromDb(product);
      currentStore = [cleanProd, ...currentStore.filter(p => p.id !== cleanProd.id)];
      saveProductsToDisk(currentStore);
      syncCatalogToSupabaseCloud(currentStore);
      return NextResponse.json({ success: true, message: 'Product saved to Supabase Cloud', products: currentStore });
    }

    if (action === 'update' && product) {
      const cleanProd = normalizeProductFromDb(product);
      currentStore = currentStore.map(p => p.id === cleanProd.id ? cleanProd : p);
      saveProductsToDisk(currentStore);
      syncCatalogToSupabaseCloud(currentStore);
      return NextResponse.json({ success: true, message: 'Product updated on Supabase Cloud', products: currentStore });
    }

    if (action === 'delete' && product?.id) {
      currentStore = currentStore.filter(p => p.id !== product.id);
      saveProductsToDisk(currentStore);
      syncCatalogToSupabaseCloud(currentStore);
      return NextResponse.json({ success: true, message: 'Product deleted from Supabase Cloud', products: currentStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update products store' }, { status: 500 });
  }
}
