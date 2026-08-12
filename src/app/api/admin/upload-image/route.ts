import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabaseServerService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  // Enforce HMAC Admin Authorization for image uploads
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Unauthorized admin request for image upload' },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let mimeType = 'image/webp';
    let prefix = 'catalog';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      prefix = (formData.get('prefix') as string) || 'catalog';

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file found in form data upload' },
          { status: 400 }
        );
      }

      mimeType = file.type || 'image/webp';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      const { imageBase64, imageMime, prefix: p } = body;
      prefix = p || 'catalog';

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Missing image payload' },
          { status: 400 }
        );
      }

      mimeType = imageMime || 'image/webp';
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    }

    if (fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file payload is 0 bytes' },
        { status: 400 }
      );
    }

    // Upload directly to Supabase Storage via privileged server service
    const uploadResult = await SupabaseServerService.uploadStorageFile(fileBuffer, mimeType, prefix);

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to persist image to Supabase Storage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
    });
  } catch (e: any) {
    console.error('[Admin Upload Route Exception]:', e?.message || e);
    return NextResponse.json(
      { success: false, error: `Upload route error: ${e?.message || 'Server exception'}` },
      { status: 500 }
    );
  }
}
