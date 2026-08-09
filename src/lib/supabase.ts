import { Order, Product } from '@/types';
import { AuditLog } from '@/lib/security';

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mrrtmrjqlzhajopevnpo.supabase.co';
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
};

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

export const SupabaseService = {
  // Save Product to Supabase PostgreSQL Database Table globally
  saveProduct: async (product: Product): Promise<boolean> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return false;

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

      const response = await fetch(`${url}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(formatted),
      });

      return response.ok;
    } catch (error) {
      console.warn('Supabase product save error:', error);
      return false;
    }
  },

  // Delete Product from Supabase PostgreSQL Database Table
  deleteProduct: async (id: string): Promise<boolean> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return false;

    try {
      const response = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  // Fetch Products from Supabase PostgreSQL Database Table globally
  fetchProducts: async (): Promise<Product[] | null> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return null;

    try {
      const response = await fetch(`${url}/rest/v1/products?select=*`, {
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) && data.length > 0 ? data.map(normalizeProductFromDb) : null;
    } catch {
      return null;
    }
  },

  // Save Order to Supabase PostgreSQL Database Table
  saveOrder: async (order: Order): Promise<boolean> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return false;

    try {
      const response = await fetch(`${url}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'return=minimal',
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
    } catch (error) {
      console.warn('Supabase order save error:', error);
      return false;
    }
  },

  // Fetch Orders from Supabase
  fetchOrders: async (): Promise<Order[] | null> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return null;

    try {
      const response = await fetch(`${url}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        items: item.items || [],
        subtotal: item.subtotal,
        discount: item.discount,
        shippingFee: item.shipping_fee,
        total: item.total,
        status: item.status,
        trackingCode: item.tracking_code,
        courier: item.courier,
        shippingAddress: item.shipping_address,
        paymentMethod: item.payment_method,
        createdAt: item.created_at,
        estimatedDelivery: item.created_at,
      }));
    } catch {
      return null;
    }
  },

  // Save Security Audit Logs to Supabase
  saveAuditLog: async (log: AuditLog): Promise<void> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return;

    try {
      await fetch(`${url}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
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
    } catch (e) {
      console.warn('Supabase audit log error:', e);
    }
  }
};
