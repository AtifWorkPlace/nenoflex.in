import { Product, SiteSettings, Order } from '@/types';
import { AuditLog } from '@/lib/security';
import { INITIAL_PRODUCTS } from '@/data/products';
import { normalizeProductFromDb, normalizeOrderFromDb } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'products_db.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings_db.json');

// Development Seed Fallbacks (Used ONLY in development mode)
let inMemoryDevCatalog: Product[] | null = null;
let inMemoryDevSettings: SiteSettings | null = null;

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
}

function getPrivilegedKey(): string | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serviceKey) return serviceKey;
  console.error('[STORAGE CRITICAL]: SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Storage administration and signed upload URL creation will fail.');
  return null;
}

function loadDevSeedProducts(): Product[] {
  if (process.env.NODE_ENV === 'production') return [];
  if (inMemoryDevCatalog && inMemoryDevCatalog.length > 0) return inMemoryDevCatalog;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryDevCatalog = parsed.map(normalizeProductFromDb);
        return inMemoryDevCatalog;
      }
    }
  } catch (e) {}
  inMemoryDevCatalog = [...INITIAL_PRODUCTS];
  return inMemoryDevCatalog;
}

function loadDevSeedSettings(): SiteSettings | null {
  if (process.env.NODE_ENV === 'production') return null;
  if (inMemoryDevSettings) return inMemoryDevSettings;
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        inMemoryDevSettings = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

export interface DatabaseCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export const SupabaseServerService = {
  // Fetch Authoritative Catalog from Supabase Cloud (public.products is single source of truth)
  fetchProducts: async (): Promise<Product[]> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Supabase Server Error]: Missing SUPABASE_SERVICE_ROLE_KEY in production');
        throw new Error('DATABASE_CONNECTION_ERROR');
      }
      return loadDevSeedProducts();
    }

    try {
      // Primary Source of Truth: public.products table
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=created_at.desc`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        next: { revalidate: 15 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeProductFromDb);
        }
      }
    } catch (e) {
      console.error('[Supabase fetchProducts Error]:', e);
    }

    try {
      // Fallback only if public.products query failed
      const resSettings = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_products_catalog&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });
      if (resSettings.ok) {
        const dataSettings = await resSettings.json();
        if (Array.isArray(dataSettings) && dataSettings[0]?.catalog_data && Array.isArray(dataSettings[0].catalog_data) && dataSettings[0].catalog_data.length > 0) {
          return dataSettings[0].catalog_data.map(normalizeProductFromDb);
        }
      }
    } catch (e) {}

    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_EMPTY_OR_UNAVAILABLE');
    }
    return loadDevSeedProducts();
  },

  // Fast Targeted Fetch for Specific Product IDs (avoids loading entire 30+ product catalog during checkout)
  fetchProductsByIds: async (ids: string[]): Promise<Product[]> => {
    if (!ids || ids.length === 0) return [];
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      const dev = loadDevSeedProducts();
      return dev.filter(p => ids.includes(p.id));
    }

    try {
      const filter = ids.length === 1 ? `eq.${ids[0]}` : `in.(${ids.join(',')})`;
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=${filter}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeProductFromDb);
        }
      }
    } catch (e) {
      console.error('[Supabase fetchProductsByIds Error]:', e);
    }

    const fallbackList = loadDevSeedProducts();
    return fallbackList.filter(p => ids.includes(p.id));
  },

  // Save Product to Supabase Cloud & Local Memory Buffer
  saveProduct: async (product: Product): Promise<boolean> => {
    const currentList = loadDevSeedProducts();
    inMemoryDevCatalog = [product, ...currentList.filter(p => p.id !== product.id)];

    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      return true;
    }

    try {
      const formatted = {
        id: product.id,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        category: product.category,
        collection: product.collection,
        price: product.price,
        showroom_price: product.showroomPrice,
        discount_percent: product.discountPercent,
        condition_score: product.conditionScore,
        condition_grade: product.conditionGrade,
        sizes: product.sizes,
        colors: product.colors,
        material: product.material,
        weight: product.weight,
        fit: product.fit,
        description: product.description,
        authenticity_seal: product.authenticitySeal,
        sanitized: product.sanitized,
        image: product.image,
        image_hover: product.imageHover,
        gallery: product.gallery,
        is_new_arrival: product.isNewArrival,
        is_trending: product.isTrending,
        is_best_seller: product.isBestSeller,
        is_limited: product.isLimited,
        stock_count: product.stockCount,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        tags: product.tags,
      };

      await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(formatted),
      });

      // Purge stale global snapshot in site_settings so fetchProducts serves clean table data
      await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_products_catalog`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return true;
    } catch (e) {
      return true;
    }
  },

  // Delete Product from Supabase Cloud
  deleteProduct: async (id: string): Promise<boolean> => {
    const currentList = loadDevSeedProducts();
    inMemoryDevCatalog = currentList.filter(p => p.id !== id);

    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return true;

    try {
      // 1. Delete row from public.products table
      await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      // 2. Wipe stale global_products_catalog snapshot in site_settings so deleted items never return
      await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_products_catalog`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return true;
    } catch (e) {
      return true;
    }
  },

  // Direct Database Partial Update: Update ONLY stock_count column
  updateProductStock: async (id: string, stockCount: number): Promise<boolean> => {
    const currentList = loadDevSeedProducts();
    const item = currentList.find(p => p.id === id);
    if (item) {
      item.stockCount = stockCount;
    }

    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return true;

    try {
      // Direct database-side partial update: UPDATE products SET stock_count = ... WHERE id = ...
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          stock_count: stockCount,
        }),
      });

      // Purge any stale global snapshot in site_settings
      await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_products_catalog`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return res.ok;
    } catch (e) {
      console.error('[Supabase updateProductStock Error]:', e);
      return false;
    }
  },

  // Save Full Catalog Array
  saveFullCatalog: async (products: Product[]): Promise<boolean> => {
    inMemoryDevCatalog = products;
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return true;
    try {
      await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_products_catalog`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // Fetch Authoritative Site Settings
  fetchSettings: async (): Promise<SiteSettings | null> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return loadDevSeedSettings();

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.global_site_settings&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        next: { revalidate: 30, tags: ['catalog'] },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.catalog_data) {
          const dbSettings = data[0].catalog_data as SiteSettings;
          return {
            ...dbSettings,
            paymentSettings: dbSettings.paymentSettings || {
              qrPrepaidEnabled: true,
              upiId: '6000149918@fam',
              payeeName: 'NenoFlex',
              paymentTimerSeconds: 290,
            },
          };
        }
      }
    } catch (e) {}

    return loadDevSeedSettings();
  },

  // Save Site Settings
  saveSettings: async (settings: SiteSettings): Promise<boolean> => {
    inMemoryDevSettings = settings;
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return true;

    try {
      await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'global_site_settings',
          catalog_data: settings,
          updated_at: new Date().toISOString(),
        }),
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // Fetch Database Coupons
  fetchCoupon: async (code: string): Promise<DatabaseCoupon | null> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return null;

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await fetch(`${supabaseUrl}/rest/v1/coupons?code=eq.${cleanCode}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          return {
            id: item.id,
            code: item.code,
            discountType: item.discount_type || 'percentage',
            discountValue: Number(item.discount_value || item.discountValue || 10),
            minOrderValue: Number(item.min_order_value || item.minOrderValue || 0),
            maxDiscount: Number(item.max_discount || item.maxDiscount || 1000),
            usageLimit: Number(item.usage_limit || item.usageLimit || 100),
            usedCount: Number(item.used_count || item.usedCount || 0),
            startsAt: item.starts_at,
            expiresAt: item.expires_at,
            isActive: Boolean(item.is_active ?? item.isActive ?? true),
          };
        }
      }
    } catch (e) {}
    return null;
  },

  // Atomic Stock Decrement via Supabase RPC or Atomic In-Memory Guard
  decrementStockAtomic: async (productId: string, quantity: number): Promise<{ success: boolean; availableStock?: number }> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();

    // 1. Try Supabase Cloud Stored Procedure RPC decrement_stock_atomic
    if (supabaseUrl && apiKey) {
      try {
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_stock_atomic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ p_product_id: productId, p_quantity: quantity }),
        });

        if (rpcRes.ok) {
          const rpcData = await rpcRes.json();
          if (rpcData && typeof rpcData === 'object') {
            if (rpcData.success) return { success: true };
            if (rpcData.error === 'INSUFFICIENT_STOCK') {
              return { success: false, availableStock: Number(rpcData.available_stock || 0) };
            }
          }
        }
      } catch (e) {}
    }

    // 2. Direct Targeted Stock Decrement (Guarantees Single-Product Fast Path)
    const prods = await SupabaseServerService.fetchProductsByIds([productId]);
    const target = prods.find(p => p.id === productId);
    if (!target) return { success: false };
    if (target.stockCount < quantity) return { success: false, availableStock: target.stockCount };

    const newStock = target.stockCount - quantity;
    target.stockCount = newStock;
    const ok = await SupabaseServerService.updateProductStock(productId, newStock);
    return { success: ok };
  },

  // Rollback Stock Decrement (Fast targeted update)
  rollbackStock: async (productId: string, quantity: number): Promise<boolean> => {
    try {
      const prods = await SupabaseServerService.fetchProductsByIds([productId]);
      const target = prods.find(p => p.id === productId);
      if (target) {
        const restoredStock = target.stockCount + quantity;
        return await SupabaseServerService.updateProductStock(productId, restoredStock);
      }
    } catch (e) {}
    return false;
  },

  // Fetch Authoritative Orders from Supabase Cloud
  fetchOrders: async (): Promise<Order[]> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return [];

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Supabase fetchOrders Error]: operation: fetchOrders, status:', response.status, 'error:', errText);
        throw new Error(`DATABASE_FETCH_FAILED: ${errText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];
      return data.map(normalizeOrderFromDb);
    } catch (e: any) {
      console.error('[Supabase fetchOrders Exception]:', e?.message || e);
      throw e;
    }
  },

  // Fetch Single Authoritative Order by ID (fast targeted query)
  fetchOrderById: async (orderId: string): Promise<Order | null> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return null;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return normalizeOrderFromDb(data[0]);
        }
      }
    } catch (e: any) {
      console.error('[Supabase fetchOrderById Error]:', e?.message);
    }
    return null;
  },

  // Save Order to Supabase Cloud
  saveOrder: async (order: Order): Promise<{ success: boolean; error?: string }> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Supabase saveOrder Error]: SUPABASE_SERVICE_ROLE_KEY missing in production');
        return { success: false, error: 'DATABASE_KEY_MISSING' };
      }
      return { success: true };
    }

    try {
      const payload = {
        id: order.id,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping_fee: order.shippingFee,
        total: order.total,
        status: order.status,
        tracking_code: order.trackingCode || null,
        courier: order.courier || null,
        shipping_address: {
          ...order.shippingAddress,
          ...(order.paymentDetails ? { _paymentDetails: order.paymentDetails } : {}),
        },
        payment_method: order.paymentMethod,
        items: order.items,
        created_at: order.createdAt,
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Supabase saveOrder Error]: operation: saveOrder, status: ${response.status}, error: ${errText}`);
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      return { success: true };
    } catch (e: any) {
      console.error('[Supabase saveOrder Exception]:', e?.message || e);
      return { success: false, error: e?.message || 'Network exception saving order' };
    }
  },

  // Update Order Status in Supabase Cloud
  updateOrderStatus: async (orderId: string, status: string): Promise<{ success: boolean; error?: string }> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return { success: true };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Supabase updateOrderStatus Error]: operation: updateOrderStatus, status: ${response.status}, error: ${errText}`);
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      return { success: true };
    } catch (e: any) {
      console.error('[Supabase updateOrderStatus Exception]:', e?.message || e);
      return { success: false, error: e?.message || 'Network error updating order status' };
    }
  },

  // Save Audit Log
  saveAuditLog: async (log: AuditLog): Promise<boolean> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return true;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: log.id,
          action: log.action,
          actor_email: log.actorEmail,
          actor_role: log.actorRole,
          target_resource: log.targetResource,
          details: log.details,
          ip_address: log.ipAddress,
          timestamp: log.timestamp,
        }),
      });
      return response.ok;
    } catch (e) {
      return true;
    }
  },

  // Self-healing bucket verification for server service-role operations
  ensureProductsBucketExists: async (): Promise<boolean> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) return false;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, apiKey);
      const { data: buckets } = await supabase.storage.listBuckets();
      
      const exists = buckets?.some(b => b.id === 'products');
      if (exists) return true;

      console.log('[Supabase Server Storage]: Bucket "products" missing. Creating bucket "products"...');
      const { error: createErr } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
      });

      if (createErr) {
        console.error('[Supabase Server Storage]: Failed to self-heal bucket "products":', createErr.message);
        return false;
      }

      return true;
    } catch (e) {
      console.error('[Supabase Server Storage]: Bucket check exception:', e);
      return false;
    }
  },

  // Upload file directly to Supabase Storage bucket 'products'
  uploadStorageFile: async (
    fileBuffer: Buffer,
    mimeType: string = 'image/webp',
    fileNamePrefix: string = 'prod'
  ): Promise<{ success: boolean; url?: string; path?: string; error?: string }> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is unconfigured on server' };
    }

    // Verify bucket exists before uploading
    const bucketReady = await SupabaseServerService.ensureProductsBucketExists();
    if (!bucketReady) {
      return { success: false, error: "Production Storage bucket 'products' does not exist." };
    }

    try {
      const ext = mimeType.includes('webp') ? 'webp' : (mimeType.includes('png') ? 'png' : 'jpg');
      const cleanPrefix = fileNamePrefix.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      const filename = `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const storagePath = `catalog/${filename}`;

      const uploadUrl = `${supabaseUrl}/storage/v1/object/products/${storagePath}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true',
        },
        body: new Uint8Array(fileBuffer),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Supabase Storage Server Upload Error]: status ${response.status}: ${errText}`);
        return { success: false, error: `Supabase Storage HTTP ${response.status}: ${errText}` };
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${storagePath}`;
      return { success: true, url: publicUrl, path: storagePath };
    } catch (e: any) {
      console.error('[Supabase Storage Server Upload Exception]:', e?.message || e);
      return { success: false, error: e?.message || 'Server exception uploading file to Supabase Storage' };
    }
  },

  // Generate a Supabase Storage Signed Upload URL using native Supabase SDK
  createSignedUploadUrl: async (filePath: string): Promise<{ success: boolean; signedUrl?: string; token?: string; path?: string; publicUrl?: string; error?: string }> => {
    const apiKey = getPrivilegedKey();
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl || !apiKey) {
      return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is unconfigured on server' };
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const serverClient = createClient(supabaseUrl, apiKey);
      const { data, error } = await serverClient.storage.from('products').createSignedUploadUrl(filePath);

      if (error || !data) {
        console.error(`[Supabase Signed Upload SDK Error]:`, error?.message);
        return { success: false, error: error?.message || 'Supabase SDK failed to create signed upload URL' };
      }

      const publicUrlData = serverClient.storage.from('products').getPublicUrl(filePath);

      return {
        success: true,
        signedUrl: data.signedUrl,
        token: data.token,
        path: data.path || filePath,
        publicUrl: publicUrlData.data.publicUrl,
      };
    } catch (e: any) {
      console.error('[Supabase Signed Upload URL Exception]:', e?.message || e);
      return { success: false, error: e?.message || 'Server exception generating Signed Upload URL' };
    }
  }
};
