import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

const DB_FILE = path.join(process.cwd(), 'products_db.json');

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

export async function GET() {
  const products = loadProductsFromDisk();
  return NextResponse.json({
    success: true,
    products,
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, product, products } = payload;
    let currentStore = loadProductsFromDisk();

    if (action === 'set_all' && Array.isArray(products)) {
      currentStore = products;
      saveProductsToDisk(currentStore);
      return NextResponse.json({ success: true, message: 'Catalog saved to disk database', products: currentStore });
    }

    if (action === 'add' && product) {
      currentStore = [product, ...currentStore.filter(p => p.id !== product.id)];
      saveProductsToDisk(currentStore);
      return NextResponse.json({ success: true, message: 'Product saved to disk database', products: currentStore });
    }

    if (action === 'update' && product) {
      currentStore = currentStore.map(p => p.id === product.id ? product : p);
      saveProductsToDisk(currentStore);
      return NextResponse.json({ success: true, message: 'Product updated on disk database', products: currentStore });
    }

    if (action === 'delete' && product?.id) {
      currentStore = currentStore.filter(p => p.id !== product.id);
      saveProductsToDisk(currentStore);
      return NextResponse.json({ success: true, message: 'Product deleted from disk database', products: currentStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update disk products' }, { status: 500 });
  }
}
