import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';
import { compressImageDataUrl } from '@/lib/imageOptimizer';

// Helper function to normalize raw database records into standard Product format
export function normalizeProductFromDb(item: any): Product {
  if (!item) return {} as Product;
  return {
    id: String(item.id || `nf-${Date.now()}`),
    sku: String(item.sku || 'SKU-NF-100'),
    barcode: String(item.barcode || '8901234567890'),
    name: String(item.name || 'Vault Product'),
    brand: (item.brand as Product['brand']) || 'Nike',
    category: (item.category as Product['category']) || 'Sweatshirts',
    collection: Array.isArray(item.collection) ? item.collection : ['Vintage Collection'],
    price: Number(item.price || 0),
    showroomPrice: Number(item.showroomPrice ?? item.showroom_price ?? (item.price ? item.price * 10 : 8999)),
    discountPercent: Number(item.discountPercent ?? item.discount_percent ?? 90),
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
    image: String(item.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'),
    imageHover: String(item.imageHover ?? item.image_hover ?? item.image),
    gallery: Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [item.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    isNewArrival: Boolean(item.isNewArrival ?? item.is_new_arrival ?? true),
    isTrending: Boolean(item.isTrending ?? item.is_trending ?? true),
    isBestSeller: Boolean(item.isBestSeller ?? item.is_best_seller ?? false),
    isLimited: Boolean(item.isLimited ?? item.is_limited ?? true),
    stockCount: Number(item.stockCount ?? item.stock_count ?? 1),
    rating: Number(item.rating || 5.0),
    reviewsCount: Number(item.reviewsCount ?? item.reviews_count ?? 12),
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
 * Creates or retrieves the singleton client-side Supabase instance for Realtime subscriptions.
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

/**
 * Direct Browser-to-Supabase-Storage Image Upload
 * Compresses the image in browser, uploads directly to Supabase Storage bucket 'products',
 * and returns the public CDN URL.
 * Image bytes NEVER pass through Vercel serverless functions or /api/products!
 */
export async function uploadProductImageDirectlyToSupabase(
  fileOrDataUrl: File | string,
  fileNamePrefix: string = 'prod'
): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    let compressedDataUrl: string;
    if (typeof fileOrDataUrl !== 'string') {
      compressedDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      });
    } else {
      compressedDataUrl = fileOrDataUrl;
    }

    // Compress image in browser canvas to 800px WebP (~100-300KB)
    const compressed = await compressImageDataUrl(compressedDataUrl, 800, 0.78);

    // Convert data URL to Blob
    const response = await fetch(compressed);
    const blob = await response.blob();

    const client = getSupabaseBrowserClient();
    if (!client) {
      console.warn('[Direct Storage Upload]: Supabase browser client unavailable, using compressed data string');
      return compressed;
    }

    const fileExt = blob.type.includes('webp') ? 'webp' : 'jpg';
    const cleanPrefix = fileNamePrefix.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const filePath = `catalog/${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Upload directly to Supabase Storage bucket 'products'
    const { data, error } = await client.storage
      .from('products')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || 'image/webp',
      });

    if (error) {
      console.warn('[Direct Storage Upload Warning]: Bucket upload failed:', error.message);
      return compressed;
    }

    // Return public CDN URL directly from Supabase Storage
    const { data: publicUrlData } = client.storage.from('products').getPublicUrl(data.path);
    console.log('[Direct Storage Upload Success]:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (e: any) {
    console.error('[Direct Storage Upload Exception]:', e?.message || e);
    return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
  }
}
