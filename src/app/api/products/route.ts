import { NextResponse } from 'next/server';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

// Global Server-Side Product Store (Persists uploaded images across page reloads and devices)
let globalProductsStore: Product[] = [...INITIAL_PRODUCTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    products: globalProductsStore,
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action, product, products } = payload;

    if (action === 'set_all' && Array.isArray(products)) {
      globalProductsStore = products;
      return NextResponse.json({ success: true, message: 'Products catalog updated live', products: globalProductsStore });
    }

    if (action === 'add' && product) {
      globalProductsStore = [product, ...globalProductsStore.filter(p => p.id !== product.id)];
      return NextResponse.json({ success: true, message: 'Product added live', products: globalProductsStore });
    }

    if (action === 'update' && product) {
      globalProductsStore = globalProductsStore.map(p => p.id === product.id ? product : p);
      return NextResponse.json({ success: true, message: 'Product updated live', products: globalProductsStore });
    }

    if (action === 'delete' && product?.id) {
      globalProductsStore = globalProductsStore.filter(p => p.id !== product.id);
      return NextResponse.json({ success: true, message: 'Product deleted live', products: globalProductsStore });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update products store' }, { status: 500 });
  }
}
