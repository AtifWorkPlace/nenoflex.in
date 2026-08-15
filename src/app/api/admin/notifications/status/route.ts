import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabasePushDB } from '@/lib/supabase-push-db';

export async function GET(req: Request) {
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deviceCount = await SupabasePushDB.getDeviceCountForAdmin(auth.session.email);
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || 'BBfQsxYzNqzWuvLtmzBBij49gky4RHEnmmcYlevLQxVjZZ447XmBGn_eRQ4yMJS5d4cQ_6elbdCOBXANEEkULAs';
    return NextResponse.json({
      success: true,
      adminEmail: auth.session.email,
      deviceCount,
      vapidPublicKey,
      vapidConfigured: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Error fetching status' }, { status: 500 });
  }
}
