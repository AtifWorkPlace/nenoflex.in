import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabaseServerService } from '@/lib/supabase-server';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB strict limit
const ALLOWED_MIME_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/gif'];

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
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Base64 upload path is disabled. Multipart form data file required.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const prefix = (formData.get('prefix') as string) || 'prod';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file found in form data upload' },
        { status: 400 }
      );
    }

    // MIME type validation
    const mimeType = (file.type || 'image/webp').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: `Invalid image type '${mimeType}'. Supported: image/webp, image/jpeg, image/png.` },
        { status: 400 }
      );
    }

    // Size limit check (2MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image is too large after compression. Max 2MB allowed. Please retry.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file payload is 0 bytes' },
        { status: 400 }
      );
    }

    // Upload directly to Supabase Storage via privileged server service
    const uploadResult = await SupabaseServerService.uploadStorageFile(fileBuffer, mimeType, prefix);

    if (!uploadResult.success || !uploadResult.url) {
      console.error('[Admin Upload Storage Failure]:', uploadResult.error);
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to persist image to Supabase Storage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path,
    });
  } catch (e: any) {
    console.error('[Admin Upload Route Exception]:', e?.message || e);
    return NextResponse.json(
      { success: false, error: `Upload route error: ${e?.message || 'Server exception'}` },
      { status: 500 }
    );
  }
}
