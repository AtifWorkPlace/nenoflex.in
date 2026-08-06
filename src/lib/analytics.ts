export interface AnalyticsMetrics {
  totalVisitors: number;
  totalSales: number;
  conversionRate: number; // e.g. 4.85%
  abandonedCarts: number;
}

export const AnalyticsEngine = {
  // GA4 Event Tracking
  trackEvent: (eventName: string, params: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  },

  trackViewItem: (productId: string, productName: string, price: number) => {
    AnalyticsEngine.trackEvent('view_item', {
      currency: 'INR',
      value: price,
      items: [{ item_id: productId, item_name: productName }],
    });
  },

  trackAddToCart: (productId: string, productName: string, price: number, quantity: number) => {
    AnalyticsEngine.trackEvent('add_to_cart', {
      currency: 'INR',
      value: price * quantity,
      items: [{ item_id: productId, item_name: productName, quantity }],
    });
  },

  trackBeginCheckout: (value: number, itemCount: number) => {
    AnalyticsEngine.trackEvent('begin_checkout', {
      currency: 'INR',
      value,
      num_items: itemCount,
    });
  },

  trackPurchase: (transactionId: string, value: number, items: Array<{ id: string; name: string; price: number }>) => {
    AnalyticsEngine.trackEvent('purchase', {
      transaction_id: transactionId,
      currency: 'INR',
      value,
      items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price })),
    });
  },

  trackAbandonedCart: (cartValue: number, itemNames: string[]) => {
    AnalyticsEngine.trackEvent('abandoned_cart', {
      currency: 'INR',
      value: cartValue,
      items_list: itemNames.join(', '),
    });
  },

  getMockDashboardMetrics: (): AnalyticsMetrics => {
    return {
      totalVisitors: 12450,
      totalSales: 458900,
      conversionRate: 4.85,
      abandonedCarts: 42,
    };
  }
};
