import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabaseServerService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  // Enforce Admin HMAC Token Authorization
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Unauthorized admin request for upload URL generation' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fileNamePrefix = 'prod', mimeType = 'image/webp' } = body;

    const fileExt = mimeType.includes('webp') ? 'webp' : (mimeType.includes('png') ? 'png' : 'jpg');
    const cleanPrefix = String(fileNamePrefix).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const filePath = `catalog/${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Create secure Signed Upload URL using server privileged key
    const signedResult = await SupabaseServerService.createSignedUploadUrl(filePath);

    if (!signedResult.success || !signedResult.signedUrl || !signedResult.publicUrl) {
      return NextResponse.json(
        { success: false, error: signedResult.error || 'Failed to create Supabase Storage signed upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedResult.signedUrl,
      token: signedResult.token,
      publicUrl: signedResult.publicUrl,
      path: filePath,
      mimeType,
    });
  } catch (e: any) {
    console.error('[Create Signed Upload URL Route Exception]:', e?.message || e);
    return NextResponse.json(
      { success: false, error: `Upload URL creation error: ${e?.message || 'Server exception'}` },
      { status: 500 }
    );
  }
}
