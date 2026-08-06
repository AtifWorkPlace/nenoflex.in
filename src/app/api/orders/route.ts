import { NextResponse } from 'next/server';
import { Order } from '@/types';
import { SupabaseService } from '@/lib/supabase';

// Global In-Memory Cloud Order Store for instant cross-device sync
let globalCloudOrders: Order[] = [
  {
    id: 'U0YJEFD9P',
    items: [
      {
        product: {
          id: 'nf-001',
          sku: 'SKU-FILA-PUFFER-GOLD',
          barcode: '8901234567890',
          name: 'FILA Classic Black Puffer Vest - Gold Trim Y2K Streetwear Sleeveless Jacket',
          brand: 'FILA',
          category: 'Jackets',
          collection: ['Vintage Collection', 'Streetwear Collection'],
          price: 349,
          showroomPrice: 3499,
          discountPercent: 90,
          conditionScore: 9.8,
          conditionGrade: 'Mint (9.8-10)',
          sizes: ['M', 'L', 'XL'],
          colors: ['Black', 'Gold'],
          material: 'Polyester Puffer Fleece',
          fit: 'Boxy Fit',
          description: 'Gold trim Y2K streetwear sleeveless puffer jacket.',
          authenticitySeal: true,
          sanitized: true,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          gallery: [],
          isNewArrival: true,
          isTrending: true,
          isBestSeller: true,
          isLimited: true,
          stockCount: 5,
          rating: 5.0,
          reviewsCount: 18,
          tags: ['fila', 'jacket', 'puffer', 'y2k'],
        },
        selectedSize: 'L',
        quantity: 1,
      },
    ],
    subtotal: 349,
    discount: 0,
    shippingFee: 80,
    total: 429,
    status: 'Placed',
    trackingCode: 'NF-6000149918',
    courier: 'BlueDart Express Air',
    shippingAddress: {
      fullName: 'Atif',
      email: 'flexnagaon@gmail.com',
      phone: '+91 60001 49919',
      address: 'Guwahati AS',
      city: 'Guwahati',
      state: 'Assam',
      pincode: '781001',
    },
    paymentMethod: 'QR Pre-Paid',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export async function GET() {
  try {
    // Try Supabase first if connected via Vercel env
    const sbOrders = await SupabaseService.fetchOrders();
    if (sbOrders && sbOrders.length > 0) {
      return NextResponse.json({ success: true, orders: sbOrders });
    }
  } catch (e) {
    console.warn('Supabase fetch fallback to cloud memory:', e);
  }

  return NextResponse.json({ success: true, orders: globalCloudOrders });
}

export async function POST(req: Request) {
  try {
    const newOrder: Order = await req.json();
    if (!newOrder || !newOrder.id) {
      return NextResponse.json({ success: false, message: 'Invalid order payload' }, { status: 400 });
    }

    // Add to global Cloud orders
    globalCloudOrders = [newOrder, ...globalCloudOrders.filter(o => o.id !== newOrder.id)];

    // Persist to Supabase if connected
    await SupabaseService.saveOrder(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order synced across all devices (PC, Phone, Tablet)',
      orders: globalCloudOrders,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to sync order' }, { status: 500 });
  }
}
