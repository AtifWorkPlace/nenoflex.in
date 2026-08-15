import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { sendTestPush } from '@/lib/pushSender';

export async function POST(req: Request) {
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendTestPush(auth.session.email);

    if (result.error && result.sent === 0) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${result.sent} device${result.sent !== 1 ? 's' : ''}`,
      sent: result.sent,
    });
  } catch (err: any) {
    console.error('[Push Test Error]:', err?.message);
    return NextResponse.json(
      { success: false, message: 'Server error sending test notification' },
      { status: 500 }
    );
  }
}
