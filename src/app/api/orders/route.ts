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
  const url = new URL(req.url);
  const singleOrderId = url.searchParams.get('id');

  // If fetching a single order by ID (e.g. customer payment page lookup)
  if (singleOrderId) {
    const order = await SupabaseServerService.fetchOrderById(singleOrderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  }

  // Otherwise enforce Cryptographic HMAC Admin Authentication for full orders list
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
  try {
    const body = await req.json();
    const { orderId, status, utrNumber, action } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: orderId is required' },
        { status: 400 }
      );
    }

    // Customer Payment Submission: "I HAVE PAID" action
    if (action === 'submit_payment' || status === 'Payment Submitted') {
      const existingOrder = await SupabaseServerService.fetchOrderById(orderId);
      if (!existingOrder) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }

      // Update order status to Payment Submitted and record submittedAt & utrNumber
      const updatedOrder: Order = {
        ...existingOrder,
        status: 'Payment Submitted',
        paymentDetails: {
          ...(existingOrder.paymentDetails || {
            upiId: '6000149918@fam',
            payeeName: 'NenoFlex',
            paymentTimerSeconds: 290,
            expiresAt: new Date(Date.now() + 290 * 1000).toISOString(),
          }),
          submittedAt: new Date().toISOString(),
          utrNumber: utrNumber ? String(utrNumber).trim() : undefined,
        },
      };

      await SupabaseServerService.saveOrder(updatedOrder);

      // Notify admin in background
      sendNewOrderPush({
        id: updatedOrder.id,
        total: updatedOrder.total,
        items: updatedOrder.items,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Payment submitted successfully. Awaiting Admin verification.',
        order: updatedOrder,
      });
    }

    // Admin Operations: Require Cryptographic HMAC Authentication
    const auth = ServerAuth.verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized admin access' },
        { status: 401 }
      );
    }

    const res = await SupabaseServerService.updateOrderStatus(orderId, status);
    if (!res.success) {
      return NextResponse.json(
        { success: false, message: res.error || 'Failed to update order status in database' },
        { status: 500 }
      );
    }

    SupabaseServerService.saveAuditLog({
      id: `audit-${Date.now()}`,
      action: 'UPDATE_ORDER_STATUS',
      actorEmail: auth.session!.email,
      actorRole: auth.session!.role,
      targetResource: 'Orders Log',
      details: `Updated order ${orderId} status to "${status}"`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
    }).catch(() => {});

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

    const { items, shippingAddress, paymentMethod: rawPaymentMethod, couponCode } = payload;
    const selectedMethod = rawPaymentMethod === 'COD' ? 'COD' : 'QR-PREPAID';

    // 2. Extract unique product IDs
    const uniqueProductIds: string[] = Array.from(
      new Set(items.map((item: any) => item.productId || item.product?.id).filter(Boolean))
    );

    // 3. Fast Parallel Fetch: Targeted Products + Coupon + Site Settings concurrently
    const [authoritativeProducts, dbCoupon, siteSettings] = await Promise.all([
      SupabaseServerService.fetchProductsByIds(uniqueProductIds),
      couponCode && typeof couponCode === 'string'
        ? SupabaseServerService.fetchCoupon(couponCode)
        : Promise.resolve(null),
      SupabaseServerService.fetchSettings(),
    ]);

    // Validate QR-PREPAID toggle
    if (selectedMethod === 'QR-PREPAID') {
      const qrEnabled = siteSettings?.paymentSettings?.qrPrepaidEnabled ?? true;
      if (!qrEnabled) {
        return NextResponse.json(
          { success: false, message: 'QR-PREPAID payment method is currently disabled by administrator.' },
          { status: 400 }
        );
      }
    }

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

    // 4. Database Coupon Validation & Limits Check
    let serverDiscount = 0;
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

    // 5. Server-Side Shipping & Total Calculation
    const serverShippingFee = serverSubtotal > 999 ? 0 : 80;
    const serverTotal = Math.max(0, serverSubtotal - serverDiscount + serverShippingFee);

    // Snapshot Payment Settings for Immutability
    const upiId = siteSettings?.paymentSettings?.upiId || '6000149918@fam';
    const payeeName = siteSettings?.paymentSettings?.payeeName || 'NenoFlex';
    const timerSeconds = siteSettings?.paymentSettings?.paymentTimerSeconds || 290;
    const expiresAt = new Date(Date.now() + timerSeconds * 1000).toISOString();

    // 6. Build Authoritative Order Record (Guaranteed Unique ID & Real Courier Fields)
    const orderId = `NF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const authoritativeOrder: Order = {
      id: orderId,
      items: validatedItems,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      shippingFee: serverShippingFee,
      total: serverTotal,
      status: selectedMethod === 'QR-PREPAID' ? 'Pending Payment' : 'Placed',
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
      paymentMethod: selectedMethod,
      paymentDetails: {
        upiId,
        payeeName,
        paymentTimerSeconds: timerSeconds,
        expiresAt,
      },
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // 7. Parallel Fast Commit: Persist Order + Decrement Stock concurrently
    const [saveResult, ...decrementResults] = await Promise.all([
      SupabaseServerService.saveOrder(authoritativeOrder),
      ...validatedItems.map(item =>
        SupabaseServerService.decrementStockAtomic(item.product.id, item.quantity).then(res => ({
          item,
          res,
        }))
      ),
    ]);

    const failedItem = decrementResults.find(d => !d.res.success);
    if (!saveResult.success || failedItem) {
      console.error('[Order Fast Commit Failed]:', { saveResult, failedItem });

      // Rollback any stock that was decremented
      const successfulDecrements = decrementResults.filter(d => d.res.success);
      await Promise.all(
        successfulDecrements.map(d => SupabaseServerService.rollbackStock(d.item.product.id, d.item.quantity))
      );

      return NextResponse.json(
        {
          success: false,
          message: failedItem
            ? `Stock reservation failed for "${failedItem.item.product.name}"`
            : 'Order creation failed to persist in production database.',
          error: saveResult.error,
        },
        { status: 400 }
      );
    }

    // 8. Asynchronous Non-Blocking Background Tasks (Zero customer delay!)
    SupabaseServerService.saveAuditLog({
      id: `audit-${Date.now()}`,
      action: 'PLACE_ORDER',
      actorEmail: authoritativeOrder.shippingAddress.email,
      actorRole: 'Customer',
      targetResource: 'Order Engine',
      details: `New order ${orderId} created for ₹${serverTotal} (Method: ${selectedMethod}, UPI: ${upiId})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
    }).catch(e => console.error('[OrderAPI] Background audit log error:', e?.message));

    sendNewOrderPush({
      id: authoritativeOrder.id,
      total: authoritativeOrder.total,
      items: authoritativeOrder.items,
    }).catch(e => console.error('[OrderAPI] Background push notification error:', e?.message));

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
