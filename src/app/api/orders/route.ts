import { NextResponse } from 'next/server';
import { Order, CartItem, Product } from '@/types';
import { SupabaseServerService } from '@/lib/supabase-server';

interface ServerCouponRule {
  code: string;
  discountPercent: number;
  minOrderValue: number;
  maxDiscount: number;
  isActive: boolean;
}

const SERVER_COUPON_RULES: Record<string, ServerCouponRule> = {
  'FLEX10': { code: 'FLEX10', discountPercent: 10, minOrderValue: 499, maxDiscount: 500, isActive: true },
  'THRIFT90': { code: 'THRIFT90', discountPercent: 15, minOrderValue: 799, maxDiscount: 1000, isActive: true },
};

export async function GET() {
  try {
    const orders = await SupabaseServerService.fetchOrders();
    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { items, shippingAddress, paymentMethod, couponCode } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email || !shippingAddress.address) {
      return NextResponse.json(
        { success: false, message: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // 1. Fetch Authoritative Products from Supabase DB
    const authoritativeProducts = await SupabaseServerService.fetchProducts();

    let serverSubtotal = 0;
    const validatedItems: CartItem[] = [];

    // 2. Validate Stock & Perform Server-Side Price Calculation
    for (const item of items) {
      const pId = item.productId || item.product?.id;
      const requestedQty = Number(item.quantity || 1);
      const selectedSize = item.selectedSize || 'M';

      if (!pId) {
        return NextResponse.json(
          { success: false, message: 'Invalid product item format' },
          { status: 400 }
        );
      }

      const dbProduct = authoritativeProducts.find(p => p.id === pId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, message: `Product ID "${pId}" no longer exists in catalog` },
          { status: 400 }
        );
      }

      if (dbProduct.stockCount < requestedQty) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockCount} left in stock.`,
            availableStock: dbProduct.stockCount,
          },
          { status: 400 }
        );
      }

      // Calculate line total using authoritative DB price ONLY
      const lineTotal = dbProduct.price * requestedQty;
      serverSubtotal += lineTotal;

      validatedItems.push({
        product: dbProduct,
        selectedSize,
        quantity: requestedQty,
      });
    }

    // 3. Server-Side Coupon Validation
    let serverDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const rule = SERVER_COUPON_RULES[cleanCode];

      if (rule && rule.isActive) {
        if (serverSubtotal >= rule.minOrderValue) {
          const rawDiscount = Math.round((serverSubtotal * rule.discountPercent) / 100);
          serverDiscount = Math.min(rawDiscount, rule.maxDiscount);
        }
      }
    }

    // 4. Server-Side Shipping & Total Calculation
    const serverShippingFee = serverSubtotal > 999 ? 0 : 80;
    const serverTotal = serverSubtotal - serverDiscount + serverShippingFee;

    // 5. Decrement Stock in Database Atomically
    for (const item of validatedItems) {
      const res = await SupabaseServerService.decrementProductStock(item.product.id, item.quantity);
      if (!res.success) {
        return NextResponse.json(
          { success: false, message: `Failed to secure stock for "${item.product.name}"` },
          { status: 400 }
        );
      }
    }

    // 6. Build Authoritative Order Record
    const orderId = `U0YJ${Math.floor(1000 + Math.random() * 9000)}P`;
    const authoritativeOrder: Order = {
      id: orderId,
      items: validatedItems,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      shippingFee: serverShippingFee,
      total: serverTotal,
      status: 'Placed',
      trackingCode: `NF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      courier: 'BlueDart Express Air',
      shippingAddress: {
        fullName: String(shippingAddress.fullName),
        email: String(shippingAddress.email),
        phone: String(shippingAddress.phone || ''),
        address: String(shippingAddress.address),
        city: String(shippingAddress.city || 'Nagaon'),
        state: String(shippingAddress.state || 'Assam'),
        pincode: String(shippingAddress.pincode || '782001'),
      },
      paymentMethod: paymentMethod || 'Prepaid',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // 7. Persist to Supabase Cloud Orders
    await SupabaseServerService.saveOrder(authoritativeOrder);

    // 8. Log Order Audit Action
    await SupabaseServerService.saveAuditLog({
      id: `audit-${Date.now()}`,
      action: 'PLACE_ORDER',
      actorEmail: authoritativeOrder.shippingAddress.email,
      actorRole: 'Customer',
      targetResource: 'Order Engine',
      details: `New order ${orderId} created for ₹${serverTotal} (Subtotal: ₹${serverSubtotal}, Discount: ₹${serverDiscount}, Shipping: ₹${serverShippingFee})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Order created & verified successfully',
      order: authoritativeOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Server error processing order placement' },
      { status: 500 }
    );
  }
}
