import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Order, CartItem, Product } from '@/types';
import { SupabaseServerService } from '@/lib/supabase-server';
import { sendNewOrderPush } from '@/lib/pushSender';

function validateOrderInput(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') return { valid: false, error: 'Invalid order JSON payload' };

  const { items, shippingAddress } = payload;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Order must contain at least one valid item' };
  }

  for (const item of items) {
    if (!item || typeof item !== 'object') return { valid: false, error: 'Invalid item format in cart' };
    const pId = item.productId || item.product?.id;
    const qty = Number(item.quantity);
    if (!pId || typeof pId !== 'string') return { valid: false, error: 'Invalid product ID' };
    if (!qty || isNaN(qty) || !Number.isInteger(qty) || qty <= 0 || qty > 10) {
      return { valid: false, error: 'Quantity must be a positive integer between 1 and 10' };
    }
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return { valid: false, error: 'Missing shipping address details' };
  }

  if (!shippingAddress.fullName || typeof shippingAddress.fullName !== 'string' || shippingAddress.fullName.trim().length === 0) {
    return { valid: false, error: 'Full name is required' };
  }

  if (!shippingAddress.email || typeof shippingAddress.email !== 'string' || !shippingAddress.email.includes('@')) {
    return { valid: false, error: 'Valid email address is required' };
  }

  if (!shippingAddress.address || typeof shippingAddress.address !== 'string' || shippingAddress.address.trim().length === 0) {
    return { valid: false, error: 'Shipping street address is required' };
  }

  return { valid: true };
}

import { ServerAuth } from '@/lib/auth';

export async function GET(req: Request) {
  // Enforce Cryptographic HMAC Admin Authentication
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: auth.error || 'Unauthorized admin access' },
      { status: 401 }
    );
  }

  try {
    const orders = await SupabaseServerService.fetchOrders();
    return NextResponse.json({ success: true, orders });
  } catch (e: any) {
    console.error('[GET /api/orders Error]:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch authoritative orders from Supabase' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  // Enforce Cryptographic HMAC Admin Authentication
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: auth.error || 'Unauthorized admin access' },
      { status: 401 }
    );
  }

  try {
    const { orderId, status } = await req.json();
    if (!orderId || typeof orderId !== 'string' || !status || typeof status !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: orderId and status are required' },
        { status: 400 }
      );
    }

    const res = await SupabaseServerService.updateOrderStatus(orderId, status);
    if (!res.success) {
      return NextResponse.json(
        { success: false, message: res.error || 'Failed to update order status in database' },
        { status: 500 }
      );
    }

    await SupabaseServerService.saveAuditLog({
      id: `audit-${Date.now()}`,
      action: 'UPDATE_ORDER_STATUS',
      actorEmail: auth.session!.email,
      actorRole: auth.session!.role,
      targetResource: 'Orders Log',
      details: `Updated order ${orderId} status to "${status}"`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Order status updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating order status' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // 1. Strict Input Schema Validation
    const val = validateOrderInput(payload);
    if (!val.valid) {
      return NextResponse.json({ success: false, message: val.error }, { status: 400 });
    }

    const { items, shippingAddress, paymentMethod, couponCode } = payload;

    // 2. Fetch Authoritative Products from Supabase DB
    const authoritativeProducts = await SupabaseServerService.fetchProducts();

    let serverSubtotal = 0;
    const validatedItems: CartItem[] = [];

    // Validate product existence and calculate authoritative server price
    for (const item of items) {
      const pId = item.productId || item.product?.id;
      const requestedQty = Number(item.quantity);
      const selectedSize = item.selectedSize || 'M';

      const dbProduct = authoritativeProducts.find(p => p.id === pId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, message: `Product ID "${pId}" no longer exists in production catalog` },
          { status: 400 }
        );
      }

      if (dbProduct.stockCount < requestedQty) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockCount} remaining.`,
            availableStock: dbProduct.stockCount,
          },
          { status: 400 }
        );
      }

      const lineTotal = dbProduct.price * requestedQty;
      serverSubtotal += lineTotal;

      validatedItems.push({
        product: dbProduct,
        selectedSize: String(selectedSize),
        quantity: requestedQty,
      });
    }

    // 3. Database Coupon Validation & Limits Check
    let serverDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const dbCoupon = await SupabaseServerService.fetchCoupon(couponCode);
      if (dbCoupon && dbCoupon.isActive) {
        if (!dbCoupon.expiresAt || new Date(dbCoupon.expiresAt).getTime() > Date.now()) {
          if (dbCoupon.usedCount < dbCoupon.usageLimit) {
            if (serverSubtotal >= dbCoupon.minOrderValue) {
              if (dbCoupon.discountType === 'percentage') {
                const rawDiscount = Math.round((serverSubtotal * dbCoupon.discountValue) / 100);
                serverDiscount = Math.min(rawDiscount, dbCoupon.maxDiscount);
              } else {
                serverDiscount = Math.min(dbCoupon.discountValue, dbCoupon.maxDiscount);
              }
            }
          }
        }
      }
    }

    // 4. Server-Side Shipping & Total Calculation
    const serverShippingFee = serverSubtotal > 999 ? 0 : 80;
    const serverTotal = Math.max(0, serverSubtotal - serverDiscount + serverShippingFee);

    // 5. Transactional Atomic Stock Reservation with Automatic Rollback
    const successfulDecrements: Array<{ productId: string; quantity: number }> = [];
    let transactionFailed = false;
    let failureMessage = '';

    for (const item of validatedItems) {
      const res = await SupabaseServerService.decrementStockAtomic(item.product.id, item.quantity);
      if (res.success) {
        successfulDecrements.push({ productId: item.product.id, quantity: item.quantity });
      } else {
        transactionFailed = true;
        failureMessage = `Stock reservation failed for item "${item.product.name}"`;
        break;
      }
    }

    // ROLLBACK EVERYTHING IF ANY ITEM FAILS
    if (transactionFailed) {
      console.warn('[Transaction Rollback]: Undoing stock decrements:', successfulDecrements);
      for (const dec of successfulDecrements) {
        await SupabaseServerService.rollbackStock(dec.productId, dec.quantity);
      }

      return NextResponse.json(
        { success: false, message: failureMessage || 'Order transaction aborted due to stock concurrency conflict' },
        { status: 400 }
      );
    }

    // 6. Build Authoritative Order Record (Guaranteed Unique ID & Real Courier Fields)
    const orderId = `NF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const authoritativeOrder: Order = {
      id: orderId,
      items: validatedItems,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      shippingFee: serverShippingFee,
      total: serverTotal,
      status: 'Placed',
      trackingCode: undefined, // Real courier tracking code assigned upon shipment
      courier: undefined,      // Real courier assigned upon dispatch
      shippingAddress: {
        fullName: String(shippingAddress.fullName).trim(),
        email: String(shippingAddress.email).trim().toLowerCase(),
        phone: String(shippingAddress.phone || '').trim(),
        address: String(shippingAddress.address).trim(),
        city: String(shippingAddress.city || 'Nagaon').trim(),
        state: String(shippingAddress.state || 'Assam').trim(),
        pincode: String(shippingAddress.pincode || '782001').trim(),
      },
      paymentMethod: paymentMethod || 'Prepaid',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // 7. Persist to Supabase Cloud Orders
    const saveResult = await SupabaseServerService.saveOrder(authoritativeOrder);

    if (!saveResult.success) {
      console.error('[Order Placement FAILED]: Supabase saveOrder returned error:', saveResult.error);

      // ROLLBACK STOCK DECREMENTS IF DATABASE INSERT FAILED
      for (const dec of successfulDecrements) {
        await SupabaseServerService.rollbackStock(dec.productId, dec.quantity);
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Order creation failed to persist in production database. Stock has been restored.',
          error: saveResult.error,
        },
        { status: 500 }
      );
    }

    // 8. Log Security Audit Action
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

    // 9. Fire-and-forget admin push notification (non-blocking, never breaks order response)
    sendNewOrderPush({
      id: authoritativeOrder.id,
      total: authoritativeOrder.total,
      items: authoritativeOrder.items,
    }).catch((e) => console.error('[OrderAPI] Push notification failed (non-fatal):', e?.message));

    return NextResponse.json({
      success: true,
      message: 'Order created & transaction verified successfully',
      order: authoritativeOrder,
    });
  } catch (error: any) {
    console.error('[Order API Exception]:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing order transaction' },
      { status: 500 }
    );
  }
}
