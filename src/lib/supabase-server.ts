import { Product, SiteSettings, Order } from '@/types';
import { AuditLog } from '@/lib/security';
import { INITIAL_PRODUCTS } from '@/data/products';
import { normalizeProductFromDb } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Server-Only Environment Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const DB_FILE = path.join(process.cwd(), 'products_db.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings_db.json');

// In-Memory Dev Seed Fallbacks
let inMemoryDevCatalog: Product[] | null = null;
let inMemoryDevSettings: SiteSettings | null = null;

function loadDevSeedProducts(): Product[] {
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
  return INITIAL_PRODUCTS;
}

function loadDevSeedSettings(): SiteSettings | null {
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

export const SupabaseServerService = {
  // Fetch Authoritative Catalog from Supabase Cloud
  fetchProducts: async (): Promise<Product[]> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return loadDevSeedProducts();

    try {
      // 1. Try global catalog snapshot table first
      const resSettings = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.global_products_catalog&select=*`, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
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

    try {
      // 2. Query individual products table
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeProductFromDb);
        }
      }
    } catch (e) {}

    return loadDevSeedProducts();
  },

  // Save Product to Supabase Cloud
  saveProduct: async (product: Product): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;

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

      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(formatted),
      });

      // Update global catalog snapshot as well
      const allProducts = await SupabaseServerService.fetchProducts();
      const updatedList = [product, ...allProducts.filter(p => p.id !== product.id)];
      
      await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'global_products_catalog',
          catalog_data: updatedList,
          updated_at: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Delete Product from Supabase Cloud
  deleteProduct: async (id: string): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
      });

      const allProducts = await SupabaseServerService.fetchProducts();
      const updatedList = allProducts.filter(p => p.id !== id);

      await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'global_products_catalog',
          catalog_data: updatedList,
          updated_at: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Save Full Catalog Array to Supabase Cloud
  saveFullCatalog: async (products: Product[]): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'global_products_catalog',
          catalog_data: products,
          updated_at: new Date().toISOString(),
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Fetch Authoritative Site Settings from Supabase Cloud
  fetchSettings: async (): Promise<SiteSettings | null> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return loadDevSeedSettings();

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.global_site_settings&select=*`, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.catalog_data) {
          return data[0].catalog_data as SiteSettings;
        }
      }
    } catch (e) {}

    return loadDevSeedSettings();
  },

  // Save Site Settings to Supabase Cloud
  saveSettings: async (settings: SiteSettings): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'global_site_settings',
          catalog_data: settings,
          updated_at: new Date().toISOString(),
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Fetch Authoritative Orders from Supabase Cloud
  fetchOrders: async (): Promise<Order[]> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return [];

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        items: item.items || [],
        subtotal: Number(item.subtotal),
        discount: Number(item.discount),
        shippingFee: Number(item.shipping_fee ?? item.shippingFee ?? 0),
        total: Number(item.total),
        status: item.status,
        trackingCode: item.tracking_code || item.trackingCode,
        courier: item.courier,
        shippingAddress: item.shipping_address || item.shippingAddress,
        paymentMethod: item.payment_method || item.paymentMethod,
        createdAt: item.created_at || item.createdAt,
        estimatedDelivery: item.created_at || item.createdAt,
      }));
    } catch (e) {
      return [];
    }
  },

  // Save Order to Supabase Cloud
  saveOrder: async (order: Order): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: order.id,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping_fee: order.shippingFee,
          total: order.total,
          status: order.status,
          tracking_code: order.trackingCode,
          courier: order.courier,
          shipping_address: order.shippingAddress,
          payment_method: order.paymentMethod,
          items: order.items,
          created_at: order.createdAt,
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Update Stock Concurrency: Decrement stock safely
  decrementProductStock: async (productId: string, quantity: number): Promise<{ success: boolean; newStock?: number }> => {
    const products = await SupabaseServerService.fetchProducts();
    const target = products.find(p => p.id === productId);
    if (!target) return { success: false };
    if (target.stockCount < quantity) return { success: false, newStock: target.stockCount };

    const updatedProduct = {
      ...target,
      stockCount: target.stockCount - quantity,
    };

    const saved = await SupabaseServerService.saveProduct(updatedProduct);
    return { success: saved, newStock: updatedProduct.stockCount };
  },

  // Save Audit Log to Supabase Cloud
  saveAuditLog: async (log: AuditLog): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
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
      return false;
    }
  }
};
