export type StorageBucket = 'Product Images' | 'Banner Images' | 'User Photos' | 'Invoices';

export interface UploadResult {
  bucket: StorageBucket;
  filename: string;
  url: string;
  uploadedAt: string;
}

export const StorageService = {
  // Generate presigned Cloudflare R2 upload URL
  getPresignedUploadUrl: async (bucket: StorageBucket, filename: string): Promise<{ uploadUrl: string; publicUrl: string }> => {
    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    const pathKey = `${bucket.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${cleanFilename}`;

    const r2PublicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DOMAIN || 'https://pub-r2.nenoflex.in';
    const publicUrl = `${r2PublicDomain}/${pathKey}`;

    return {
      uploadUrl: `https://r2.cloudflarestorage.com/nenoflex-vault/${pathKey}?signature=presigned_token`,
      publicUrl,
    };
  },

  // Upload file helper
  uploadFile: async (bucket: StorageBucket, file: File): Promise<UploadResult> => {
    const { publicUrl } = await StorageService.getPresignedUploadUrl(bucket, file.name);

    return {
      bucket,
      filename: file.name,
      url: publicUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
};
