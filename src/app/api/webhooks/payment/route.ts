import { NextResponse } from 'next/server';
import { SecuritySuite } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify webhook signature (Placeholder ready for live keys)
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('stripe-signature');

    // Audit Log webhook event
    SecuritySuite.logAuditAction(
      'PAYMENT_WEBHOOK_RECEIVED',
      'system@gateway',
      'Customer',
      'Payment Webhook API',
      `Received payment webhook payload. Event: ${body?.event || 'payment.authorized'}`
    );

    return NextResponse.json({
      success: true,
      message: 'Payment webhook received & logged successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process payment webhook' },
      { status: 400 }
    );
  }
}
