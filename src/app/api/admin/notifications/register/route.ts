import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabasePushDB } from '@/lib/supabase-push-db';

export async function POST(req: Request) {
  // Verify existing admin auth
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, message: 'Invalid push subscription payload' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || '';

    const saved = await SupabasePushDB.saveSubscription({
      admin_email: auth.session.email,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      user_agent: userAgent.slice(0, 200),
    });

    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Failed to save push subscription' },
        { status: 500 }
      );
    }

    const deviceCount = await SupabasePushDB.getDeviceCountForAdmin(auth.session.email);

    return NextResponse.json({
      success: true,
      message: 'Push subscription registered successfully',
      deviceCount,
    });
  } catch (err: any) {
    console.error('[Push Register Error]:', err?.message);
    return NextResponse.json(
      { success: false, message: 'Server error registering subscription' },
      { status: 500 }
    );
  }
}
