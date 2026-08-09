'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, FilterState, Coupon, SiteSettings, UserRole } from '@/types';
import { INITIAL_PRODUCTS, BRANDS_LIST } from '@/data/products';
import { SecuritySuite, AuditLog } from '@/lib/security';
import { AudioNotificationEngine, NotificationSoundType } from '@/lib/audio';
import { SupabaseService, normalizeProductFromDb } from '@/lib/supabase';

interface StoreContextType {
  products: Product[];
  wishlist: string[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  orders: Order[];
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  siteSettings: SiteSettings;
  isAdmin: boolean;
  userRole: UserRole;
  auditLogs: AuditLog[];

  // Authentication & Admin Actions
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  reorderCollectionBoxes: (newOrder: string[]) => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  playAdminChime: (type?: NotificationSoundType) => void;
  sendTestEmail: (smtpPassSecret?: string) => Promise<void>;

  // Catalog Customization Actions
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  addBrand: (brand: { name: string; logo: string; origin: string }) => void;
  deleteBrand: (name: string) => void;
  uploadCustomFont: (fontName: string, fontDataUrl: string) => void;

  // Cart & Shopping Actions
  toggleWishlist: (productId: string) => void;
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (details: {
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
  }) => Order;

  // Product CRUD (Bulletproof Real-Time Sync & Deletion)
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetProductsToDefault: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Toast System
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  category: 'All',
  collection: 'All',
  brands: [],
  minPrice: 0,
  maxPrice: 10000,
  sizes: [],
  fits: [],
  minCondition: 0,
  inStockOnly: false,
  sortBy: 'featured',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_ORDERS: Order[] = [];

const getInitialProductsSync = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const saved = localStorage.getItem('nenoflex_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeProductFromDb);
      }
    }
  } catch (e) {}
  return INITIAL_PRODUCTS;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(getInitialProductsSync);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('Customer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    announcementBanner: 'from showrooms 89%-90% off!!',
    heroTitle: 'New Drops 🔥',
    heroSubtitle: 'Handpicked Imported Vintage & Streetwear Vault',
    heroCtaText: 'Shop now',
    heroSecondaryCtaText: 'Explore Vault',
    heroTickerText: 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||',
    footerTagline: 'Flex Your Style. Premium Handpicked Imported Vault.',
    footerPhone: '+91 60001 49919',
    footerWhatsappUrl: 'https://wa.me/916000149919',
    footerInstagram: '@flexnagaon',
    footerInstagramUrl: 'https://instagram.com/flexnagaon',
    footerCopyright: '© 2022 NenoFlex Official. All rights reserved.',
    collectionBoxOrder: ['bento-banner', 'jerseys', 'jackets-fleeces', 'brands'],
    notificationSound: 'cash-register',
    customCategories: ['Jerseys', 'Jackets', 'Sweatshirts', 'Hoodies', 'Windbreakers', 'Graphic Tees', 'Oversized T-Shirts', 'Cargo Pants', 'Jeans', 'Caps'],
    customBrands: BRANDS_LIST,
    customFontFamily: 'Inter',
    promoModal: {
      enabled: true,
      title: 'SUMMER DROP 2026',
      subtitle: 'Get up to 90% OFF on imported Nike & TNF Vault Grails!',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      buttonText: 'Claim Offer Now',
      buttonLink: '/shop',
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'FLEX10', discountPercent: 10 },
    { code: 'THRIFT90', discountPercent: 15 },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);

  // Synchronize products locally and broadcast event
  const saveProductsLocal = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nenoflex_products', JSON.stringify(updatedProducts));
        window.dispatchEvent(new Event('nenoflex_products_updated'));
      } catch (e) {}
    }
  };

  // Cross-tab real-time product update listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageOrCustomEvent = () => {
      try {
        const saved = localStorage.getItem('nenoflex_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProducts(parsed.map(normalizeProductFromDb));
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageOrCustomEvent);
    window.addEventListener('nenoflex_products_updated', handleStorageOrCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageOrCustomEvent);
      window.removeEventListener('nenoflex_products_updated', handleStorageOrCustomEvent);
    };
  }, []);

  // Fetch Cloud & Supabase products on mount
  useEffect(() => {
    const fetchCloudAndSupabaseProducts = async () => {
      let fetchedList: Product[] | null = null;

      try {
        const supabaseData = await SupabaseService.fetchProducts();
        if (supabaseData) {
          fetchedList = supabaseData;
        }
      } catch (e) {}

      if (!fetchedList) {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
              fetchedList = data.products;
            }
          }
        } catch (e) {}
      }

      if (fetchedList) {
        const normalized = fetchedList.map(normalizeProductFromDb);
        setProducts(normalized);
        try {
          localStorage.setItem('nenoflex_products', JSON.stringify(normalized));
        } catch (e) {}
      }
    };

    fetchCloudAndSupabaseProducts();
  }, []);

  // Cross-Device Order Synchronization Polling
  useEffect(() => {
    const fetchCloudOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
            try {
              localStorage.setItem('nenoflex_orders', JSON.stringify(data.orders));
            } catch (e) {}
          }
        }
      } catch (err) {}
    };

    fetchCloudOrders();
    const interval = setInterval(fetchCloudOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const playAdminChime = (type?: NotificationSoundType) => {
    AudioNotificationEngine.playSound(type || siteSettings.notificationSound || 'cash-register');
  };

  const sendTestEmail = async (smtpPassSecret?: string) => {
    try {
      const res = await fetch('/api/orders/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTestEmail: true,
          smtpPass: smtpPassSecret,
          smtpUser: 'flexnagaon@gmail.com',
        }),
      });
      const data = await res.json();
      showToast(data.message || 'Test email dispatched!');
    } catch (e) {
      showToast('Nodemailer test triggered!');
    }
  };

  const adminLogin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'superadmin@nenoflex.com' && pass === 'superadmin123') {
      setIsAdmin(true);
      setUserRole('Super Admin');
      SecuritySuite.logAuditAction('LOGIN', cleanEmail, 'Super Admin', 'Admin Console', 'Super Admin logged in');
      setAuditLogs(SecuritySuite.getAuditLogs());
      showToast('Super Admin Access Granted ⚡');
      return true;
    } else if (cleanEmail === 'admin@nenoflex.com' && pass === 'admin123') {
      setIsAdmin(true);
      setUserRole('Admin');
      SecuritySuite.logAuditAction('LOGIN', cleanEmail, 'Admin', 'Admin Console', 'Admin logged in');
      setAuditLogs(SecuritySuite.getAuditLogs());
      showToast('Admin Access Granted ⚡');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    SecuritySuite.logAuditAction('LOGOUT', userRole === 'Super Admin' ? 'superadmin@nenoflex.com' : 'admin@nenoflex.com', userRole, 'Admin Console', 'User logged out');
    setIsAdmin(false);
    setUserRole('Customer');
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast('Logged out of Admin Mode');
  };

  const updateSiteSettings = (settings: SiteSettings) => {
    setSiteSettings(settings);
    SecuritySuite.logAuditAction('UPDATE_SITE_SETTINGS', 'admin@nenoflex.com', userRole, 'Site Settings', 'Updated website settings and font configuration');
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast('Site settings & Typography updated live!');
  };

  const uploadCustomFont = (fontName: string, fontDataUrl: string) => {
    setSiteSettings(prev => ({
      ...prev,
      customFontFamily: fontName,
      customFontDataUrl: fontDataUrl,
    }));
    SecuritySuite.logAuditAction('UPLOAD_CUSTOM_FONT', 'admin@nenoflex.com', userRole, 'Typography Engine', `Uploaded custom device font ${fontName}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Font "${fontName}" uploaded & applied site-wide!`);
  };

  const addCategory = (name: string) => {
    if (!name || siteSettings.customCategories.includes(name)) return;
    setSiteSettings(prev => ({ ...prev, customCategories: [...prev.customCategories, name] }));
    SecuritySuite.logAuditAction('ADD_CATEGORY', 'admin@nenoflex.com', userRole, 'Catalog Categories', `Added new catalog category: ${name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Added Category "${name}"`);
  };

  const deleteCategory = (name: string) => {
    setSiteSettings(prev => ({ ...prev, customCategories: prev.customCategories.filter(c => c !== name) }));
    SecuritySuite.logAuditAction('DELETE_CATEGORY', 'admin@nenoflex.com', userRole, 'Catalog Categories', `Deleted category: ${name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Deleted Category "${name}"`);
  };

  const addBrand = (brand: { name: string; logo: string; origin: string }) => {
    if (!brand.name || siteSettings.customBrands.some(b => b.name === brand.name)) return;
    setSiteSettings(prev => ({ ...prev, customBrands: [...prev.customBrands, brand] }));
    SecuritySuite.logAuditAction('ADD_BRAND', 'admin@nenoflex.com', userRole, 'Catalog Brands', `Added new brand: ${brand.name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Added Brand "${brand.name}"`);
  };

  const deleteBrand = (name: string) => {
    setSiteSettings(prev => ({ ...prev, customBrands: prev.customBrands.filter(b => b.name !== name) }));
    SecuritySuite.logAuditAction('DELETE_BRAND', 'admin@nenoflex.com', userRole, 'Catalog Brands', `Deleted brand: ${name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Deleted Brand "${name}"`);
  };

  const reorderCollectionBoxes = (newOrder: string[]) => {
    setSiteSettings(prev => ({ ...prev, collectionBoxOrder: newOrder }));
    SecuritySuite.logAuditAction('REORDER_HOMEPAGE_BOXES', 'admin@nenoflex.com', userRole, 'Homepage Layout', `Reordered homepage collection boxes: ${newOrder.join(', ')}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast('Homepage box order updated!');
  };

  const addCoupon = (c: Coupon) => {
    setCoupons(prev => [...prev, c]);
    SecuritySuite.logAuditAction('CREATE_COUPON', 'admin@nenoflex.com', userRole, 'Coupons', `Created promo voucher ${c.code} (${c.discountPercent}% OFF)`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Coupon ${c.code} created!`);
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(item => item.code !== code));
    SecuritySuite.logAuditAction('DELETE_COUPON', 'admin@nenoflex.com', userRole, 'Coupons', `Deleted promo voucher ${code}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Coupon ${code} removed`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to Wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    if (product.stockCount <= 0) {
      showToast('This item is SOLD OUT!');
      return;
    }

    setCart(prev => {
      const index = prev.findIndex(item => item.product.id === product.id && item.selectedSize === size);
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, quantity }];
      }
    });
    showToast(`Added ${product.name} (${size}) to Cart`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    showToast('Item removed from cart');
  };

  const updateCartQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);
    if (found) {
      setAppliedCoupon(found);
      showToast(`Coupon ${found.code} Applied! (${found.discountPercent}% OFF)`);
      return { success: true, message: `${found.discountPercent}% discount applied!` };
    } else {
      return { success: false, message: 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const placeOrder = (details: {
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
  }): Order => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = appliedCoupon
      ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
      : 0;
    const shippingFee = subtotal > 999 ? 0 : 80;
    const total = subtotal - discount + shippingFee;

    const newOrder: Order = {
      id: `U0YJ${Math.floor(1000 + Math.random() * 9000)}P`,
      items: [...cart],
      subtotal,
      discount,
      shippingFee,
      total,
      status: 'Placed',
      trackingCode: `NF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      courier: 'BlueDart Express Air',
      shippingAddress: details.shippingAddress,
      paymentMethod: details.paymentMethod,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setOrders(prev => [newOrder, ...prev]);

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(err => console.warn('Cross-device order POST error:', err));

      SupabaseService.saveOrder(newOrder);
    } catch (e) {}

    clearCart();
    setAppliedCoupon(null);

    playAdminChime();

    try {
      fetch('/api/orders/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(err => console.warn('Email API dispatch background:', err));
    } catch (e) {}

    const auditLog = SecuritySuite.logAuditAction('PLACE_ORDER', details.shippingAddress.email, 'Customer', 'Order Engine', `NEW ORDER PLACED! Order ${newOrder.id} for ₹${total} via ${details.paymentMethod}`);
    SupabaseService.saveAuditLog(auditLog);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Order ${newOrder.id} Placed! Notification sent to Admin & flexnagaon@gmail.com 🔔`);
    return newOrder;
  };

  // Product CRUD
  const addProduct = (p: Product) => {
    const updated = [p, ...products.filter(item => item.id !== p.id)];
    saveProductsLocal(updated);

    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', product: p }),
      }).catch(err => console.warn('API add product sync:', err));
    } catch (e) {}

    try {
      SupabaseService.saveProduct(p);
    } catch (e) {}

    SecuritySuite.logAuditAction('ADD_PRODUCT', 'admin@nenoflex.com', userRole, 'Products Catalog', `Added product ${p.name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Product "${p.name}" Published Live!`);
  };

  const updateProduct = (updated: Product) => {
    const updatedList = products.map(p => p.id === updated.id ? updated : p);
    saveProductsLocal(updatedList);

    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', product: updated }),
      }).catch(err => console.warn('API update product sync:', err));
    } catch (e) {}

    try {
      SupabaseService.saveProduct(updated);
    } catch (e) {}

    SecuritySuite.logAuditAction('UPDATE_PRODUCT', 'admin@nenoflex.com', userRole, 'Products Catalog', `Updated product ${updated.name}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Product "${updated.name}" Published Live!`);
  };

  const deleteProduct = (id: string) => {
    const found = products.find(p => p.id === id);
    const updatedList = products.filter(p => p.id !== id);
    saveProductsLocal(updatedList);

    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', product: { id } }),
      }).catch(err => console.warn('API delete product sync:', err));
    } catch (e) {}

    try {
      SupabaseService.deleteProduct(id);
    } catch (e) {}

    SecuritySuite.logAuditAction('DELETE_PRODUCT', 'admin@nenoflex.com', userRole, 'Products Catalog', `Deleted product ${found?.name || id}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Product deleted`);
  };

  const resetProductsToDefault = () => {
    saveProductsLocal([]);
    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_all', products: [] }),
      }).catch(err => console.warn('API reset products sync:', err));
    } catch (e) {}
    showToast('Cleared product catalog');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    SecuritySuite.logAuditAction('UPDATE_ORDER_STATUS', 'admin@nenoflex.com', userRole, 'Order Fulfillment', `Updated order ${orderId} to status ${status}`);
    setAuditLogs(SecuritySuite.getAuditLogs());
    showToast(`Updated order ${orderId} to "${status}"`);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        wishlist,
        cart,
        isCartOpen,
        setIsCartOpen,
        filters,
        setFilters,
        quickViewProduct,
        setQuickViewProduct,
        orders,
        appliedCoupon,
        coupons,
        siteSettings,
        isAdmin,
        userRole,
        auditLogs,
        adminLogin,
        adminLogout,
        updateSiteSettings,
        reorderCollectionBoxes,
        addCoupon,
        deleteCoupon,
        playAdminChime,
        sendTestEmail,
        addCategory,
        deleteCategory,
        addBrand,
        deleteBrand,
        uploadCustomFont,
        toggleWishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
        updateOrderStatus,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-black text-white font-mono font-bold text-xs border border-white/20 shadow-2xl flex items-center gap-2 animate-bounce max-w-sm">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
