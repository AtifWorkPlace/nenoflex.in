import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';
import { compressImageDataUrl, compressImageFileToBlob } from '@/lib/imageOptimizer';

// Helper function to normalize raw database records into standard Product format
export function normalizeProductFromDb(item: any): Product {
  if (!item) return {} as Product;
  const primaryImg = String(item.image || '');
  const hoverImg = String(item.imageHover ?? item.image_hover ?? primaryImg);
  const galleryImgs = Array.isArray(item.gallery) && item.gallery.length > 0
    ? item.gallery
    : (primaryImg ? [primaryImg] : []);

  return {
    id: String(item.id || ''),
    sku: String(item.sku || ''),
    barcode: String(item.barcode || ''),
    name: String(item.name || ''),
    brand: (item.brand as Product['brand']) || 'Nike',
    category: (item.category as Product['category']) || 'Sweatshirts',
    collection: Array.isArray(item.collection) ? item.collection : ['Vintage Collection'],
    price: Number(item.price || 0),
    showroomPrice: Number(item.showroomPrice ?? item.showroom_price ?? (item.price ? item.price * 10 : 0)),
    discountPercent: Number(item.discountPercent ?? item.discount_percent ?? 0),
    conditionScore: Number(item.conditionScore ?? item.condition_score ?? 9.8),
    conditionGrade: (item.conditionGrade || item.condition_grade || 'Mint (9.8-10)') as Product['conditionGrade'],
    sizes: Array.isArray(item.sizes) ? item.sizes : ['M', 'L'],
    colors: Array.isArray(item.colors) ? item.colors : ['Black'],
    material: String(item.material || '100% Cotton'),
    weight: String(item.weight || '500g'),
    fit: (item.fit as Product['fit']) || 'Boxy Fit',
    description: String(item.description || ''),
    authenticitySeal: Boolean(item.authenticitySeal ?? item.authenticity_seal ?? true),
    sanitized: Boolean(item.sanitized ?? true),
    image: primaryImg,
    imageHover: hoverImg,
    gallery: galleryImgs,
    isNewArrival: Boolean(item.isNewArrival ?? item.is_new_arrival ?? true),
    isTrending: Boolean(item.isTrending ?? item.is_trending ?? true),
    isBestSeller: Boolean(item.isBestSeller ?? item.is_best_seller ?? false),
    isLimited: Boolean(item.isLimited ?? item.is_limited ?? true),
    stockCount: Number(item.stockCount ?? item.stock_count ?? 1),
    rating: Number(item.rating || 5.0),
    reviewsCount: Number(item.reviewsCount ?? item.reviews_count ?? 0),
    tags: Array.isArray(item.tags) ? item.tags : ['thrift'],
  };
}

// Helper function to normalize raw database records into standard Order format
export function normalizeOrderFromDb(item: any): Order {
  if (!item) return {} as Order;
  const rawAddr = item.shipping_address || item.shippingAddress || {};
  return {
    id: String(item.id || `NF-${Date.now()}`),
    items: Array.isArray(item.items) ? item.items : [],
    subtotal: Number(item.subtotal || 0),
    discount: Number(item.discount || 0),
    shippingFee: Number(item.shipping_fee ?? item.shippingFee ?? 0),
    total: Number(item.total || 0),
    status: (item.status as Order['status']) || 'Placed',
    trackingCode: item.tracking_code || item.trackingCode || null,
    courier: item.courier || null,
    shippingAddress: {
      fullName: String(rawAddr.fullName || rawAddr.full_name || 'Valued Customer'),
      email: String(rawAddr.email || ''),
      phone: String(rawAddr.phone || ''),
      address: String(rawAddr.address || ''),
      city: String(rawAddr.city || ''),
      state: String(rawAddr.state || ''),
      pincode: String(rawAddr.pincode || ''),
    },
    paymentMethod: String(item.payment_method || item.paymentMethod || 'Prepaid'),
    paymentId: item.payment_id || item.paymentId,
    createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
    estimatedDelivery: String(item.estimated_delivery || item.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  };
}

let browserClient: SupabaseClient | null = null;

/**
 * Creates or retrieves the singleton client-side Supabase instance for Realtime subscriptions & Storage uploads.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[Supabase Realtime]: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    return null;
  }

  try {
    browserClient = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return browserClient;
  } catch (e) {
    console.error('[Supabase Realtime Client Init Error]:', e);
    return null;
  }
}

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Direct Browser-to-Supabase Storage Image Upload Pipeline
 * 1. Resizes & compresses image directly in browser canvas to WebP Blob (~100-250KB).
 * 2. Uploads directly to Supabase Storage bucket 'products' using client SDK.
 * 3. Fallback: If browser RLS blocks direct client upload, calls authenticated /api/admin/upload-image.
 * 4. STRICT CONTRACT: Returns { success: true, url: "https://..." } OR { success: false, error: "Reason" }.
 * 5. ABSOLUTE RULE: NEVER returns Base64 fallback string on failure.
 */
export async function uploadProductImageDirectlyToSupabase(
  fileOrDataUrl: File | string,
  adminToken?: string | null,
  fileNamePrefix: string = 'prod'
): Promise<StorageUploadResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Browser environment required for image upload' };
  }

  if (!fileOrDataUrl) {
    return { success: false, error: 'No image file provided' };
  }

  try {
    let blobToUpload: Blob;

    if (typeof fileOrDataUrl !== 'string') {
      blobToUpload = await compressImageFileToBlob(fileOrDataUrl, 800, 0.78);
    } else if (fileOrDataUrl.startsWith('data:image')) {
      const compressedDataUrl = await compressImageDataUrl(fileOrDataUrl, 800, 0.78);
      const response = await fetch(compressedDataUrl);
      blobToUpload = await response.blob();
    } else if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
      return { success: true, url: fileOrDataUrl };
    } else {
      return { success: false, error: 'Invalid image format provided' };
    }

    const client = getSupabaseBrowserClient();
    const cleanPrefix = fileNamePrefix.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const fileExt = blobToUpload.type.includes('webp') ? 'webp' : 'jpg';
    const filePath = `catalog/${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Attempt 1: Direct browser upload to Supabase Storage bucket
    if (client) {
      const { data, error } = await client.storage
        .from('products')
        .upload(filePath, blobToUpload, {
          cacheControl: '3600',
          upsert: true,
          contentType: blobToUpload.type || 'image/webp',
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = client.storage.from('products').getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) {
          console.log('[Supabase Direct Browser Upload Success]:', publicUrlData.publicUrl);
          return { success: true, url: publicUrlData.publicUrl };
        }
      } else if (error) {
        console.warn('[Supabase Direct Browser Upload Warning]:', error.message);
      }
    }

    // Attempt 2: Authenticated Server-Side Upload Route (If browser client is missing or blocked by RLS)
    if (adminToken) {
      const formData = new FormData();
      formData.append('file', blobToUpload, `image.${fileExt}`);
      formData.append('prefix', cleanPrefix);

      const serverRes = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const serverData = await serverRes.json();
      if (serverRes.ok && serverData.success && serverData.url) {
        console.log('[Supabase Authenticated Server Upload Success]:', serverData.url);
        return { success: true, url: serverData.url };
      } else if (serverData.error) {
        return { success: false, error: serverData.error };
      }
    }

    return {
      success: false,
      error: 'Supabase Storage upload failed. Please verify storage bucket permissions and admin session.',
    };
  } catch (e: any) {
    console.error('[Supabase Storage Upload Exception]:', e?.message || e);
    return { success: false, error: e?.message || 'Storage upload exception occurred' };
  }
}
