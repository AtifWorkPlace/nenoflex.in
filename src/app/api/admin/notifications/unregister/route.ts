import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabasePushDB } from '@/lib/supabase-push-db';

export async function POST(req: Request) {
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing endpoint' },
        { status: 400 }
      );
    }

    await SupabasePushDB.hardDeleteSubscription(endpoint);

    return NextResponse.json({ success: true, message: 'Subscription removed' });
  } catch (err: any) {
    console.error('[Push Unregister Error]:', err?.message);
    return NextResponse.json(
      { success: false, message: 'Server error unregistering' },
      { status: 500 }
    );
  }
}
