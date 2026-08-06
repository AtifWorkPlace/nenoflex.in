import { Order, SiteSettings } from '@/types';
import { AuditLog } from '@/lib/security';

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
};

export const SupabaseService = {
  // Save Order to Supabase PostgreSQL Database Table
  saveOrder: async (order: Order): Promise<boolean> => {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      console.log('Supabase: Running in local localStorage mode (Vercel env variables ready)');
      return false;
    }

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
