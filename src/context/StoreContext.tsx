'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, FilterState, Coupon, SiteSettings, UserRole, FooterQuickLink } from '@/types';
import { INITIAL_PRODUCTS, BRANDS_LIST } from '@/data/products';
import { SecuritySuite, AuditLog } from '@/lib/security';
import { AudioNotificationEngine, NotificationSoundType } from '@/lib/audio';
import { normalizeProductFromDb } from '@/lib/supabase';

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
  adminToken: string | null;
  isLoadingCatalog: boolean;
  catalogError: string | null;

  // Authentication & Admin Actions
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  reorderCollectionBoxes: (newOrder: string[]) => Promise<void>;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  playAdminChime: (type?: NotificationSoundType) => void;
  sendTestEmail: (smtpPassSecret?: string) => Promise<void>;
  forceLockAndSaveAllToCloud: () => Promise<void>;

  // Catalog Customization Actions
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  addBrand: (brand: { name: string; logo: string; origin: string }) => void;
  deleteBrand: (name: string) => void;
  uploadCustomFont: (fontName: string, fontDataUrl: string) => void;
  addFooterQuickLink: (link: FooterQuickLink) => void;
  deleteFooterQuickLink: (index: number) => void;
  reorderFooterQuickLinks: (newLinks: FooterQuickLink[]) => void;

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
  }) => Promise<Order | null>;

  // Product CRUD
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetProductsToDefault: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Toast System
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshCatalog: () => Promise<void>;
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

const DEFAULT_FOOTER_QUICK_LINKS: FooterQuickLink[] = [
  { label: 'New Arrivals', href: '/shop?category=New Arrivals' },
  { label: 'New Drops 🔥', href: '/shop' },
  { label: 'Vintage Fleeces & Vault Grails', href: '/shop?category=Jackets' },
  { label: 'Jerseys & Sportswear', href: '/shop?category=Jerseys' },
  { label: 'Cargo Pants & Jeans', href: '/shop?category=Cargo Pants' },
  { label: 'Clearance Vault', href: '/shop?category=Clearance' },
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementBanner: 'from showrooms 89%-90% off!!',
  heroTitle: 'New Drops 🔥',
  heroSubtitle: 'Handpicked Imported Vintage & Streetwear Vault',
  heroCtaText: 'Shop now',
  heroSecondaryCtaText: 'Explore Vault',
  heroTickerText: 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||',
  heroPosterTag1: 'New Drops 🔥',
  heroPosterTitle1: 'NEW ARRIVAL',
  heroPosterSubtitle1: 'www.nenoflex.in',
  heroPosterLink1: '/shop?category=New Arrivals',
  heroPosterImage2: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  heroPosterTitle2: 'Jackets / Windcheaters',
  heroPosterLink2: '/shop?category=Jackets',
  heroPosterImage3: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  heroPosterTitle3: 'New Drops Jerseys 🔥 🚀',
  heroPosterLink3: '/shop?category=Jerseys',
  footerTagline: 'Flex Your Style. Premium Handpicked Imported Vault.',
  footerPhone: '+91 60001 49919',
  footerWhatsappUrl: 'https://wa.me/916000149919',
  footerInstagram: '@flexnagaon',
  footerInstagramUrl: 'https://instagram.com/flexnagaon',
  footerCopyright: '© 2022 NenoFlex Official. All rights reserved.',
  footerQuickLinks: DEFAULT_FOOTER_QUICK_LINKS,
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
};

const getInitialCartSync = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('nenoflex_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const getInitialWishlistSync = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('nenoflex_wishlist');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [wishlist, setWishlist] = useState<string[]>(getInitialWishlistSync);
  const [cart, setCart] = useState<CartItem[]>(getInitialCartSync);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('Customer');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'FLEX10', discountPercent: 10 },
    { code: 'THRIFT90', discountPercent: 15 },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Persist transient cart state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nenoflex_cart', JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart]);

  // Persist transient wishlist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nenoflex_wishlist', JSON.stringify(wishlist));
      } catch (e) {}
    }
  }, [wishlist]);

  // Fetch Authoritative Catalog & Site Settings from Server API
  const refreshCatalog = async () => {
    setIsLoadingCatalog(true);
    setCatalogError(null);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.products)) {
            setProducts(data.products.map(normalizeProductFromDb));
          }
          if (data.siteSettings && typeof data.siteSettings === 'object') {
            setSiteSettings(prev => ({ ...prev, ...data.siteSettings }));
          }
        }
      } else {
        setCatalogError('Failed to load live catalog from server');
      }
    } catch (e) {
      setCatalogError('Network connection error while fetching catalog');
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  // Fetch Orders for Admin
  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshOrders();
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

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setIsAdmin(true);
        setUserRole(data.userRole || 'Admin');
        setAdminToken(data.token);
        showToast(`${data.userRole} Access Granted ⚡`);
        return true;
      } else {
        showToast(data.message || 'Invalid Admin Credentials');
        return false;
      }
    } catch (e) {
      showToast('Admin login server error');
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    setUserRole('Customer');
    setAdminToken(null);
    showToast('Logged out of Admin Mode');
  };

  const updateSiteSettings = async (settings: SiteSettings) => {
    setSiteSettings(settings);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'save_settings', siteSettings: settings }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Site settings updated live globally!');
      } else {
        showToast(`Save Settings Error: ${data.message}`);
      }
    } catch (e) {
      showToast('Failed to connect to server');
    }
  };

  const forceLockAndSaveAllToCloud = async () => {
    await updateSiteSettings(siteSettings);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'set_all', products }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Authoritative Catalog & Settings Locked to Supabase Cloud!');
      }
    } catch (e) {}
  };

  const uploadCustomFont = (fontName: string, fontDataUrl: string) => {
    const updated = {
      ...siteSettings,
      customFontFamily: fontName,
      customFontDataUrl: fontDataUrl,
    };
    updateSiteSettings(updated);
    showToast(`Font "${fontName}" applied site-wide!`);
  };

  const addFooterQuickLink = (link: FooterQuickLink) => {
    if (!link.label || !link.href) return;
    const current = siteSettings.footerQuickLinks || DEFAULT_FOOTER_QUICK_LINKS;
    const updated = {
      ...siteSettings,
      footerQuickLinks: [...current, link],
    };
    updateSiteSettings(updated);
  };

  const deleteFooterQuickLink = (index: number) => {
    const current = siteSettings.footerQuickLinks || DEFAULT_FOOTER_QUICK_LINKS;
    const updated = {
      ...siteSettings,
      footerQuickLinks: current.filter((_, i) => i !== index),
    };
    updateSiteSettings(updated);
  };

  const reorderFooterQuickLinks = (newLinks: FooterQuickLink[]) => {
    const updated = {
      ...siteSettings,
      footerQuickLinks: newLinks,
    };
    updateSiteSettings(updated);
  };

  const addCategory = (name: string) => {
    if (!name || siteSettings.customCategories.includes(name)) return;
    const updated = { ...siteSettings, customCategories: [...siteSettings.customCategories, name] };
    updateSiteSettings(updated);
  };

  const deleteCategory = (name: string) => {
    const updated = { ...siteSettings, customCategories: siteSettings.customCategories.filter(c => c !== name) };
    updateSiteSettings(updated);
  };

  const addBrand = (brand: { name: string; logo: string; origin: string }) => {
    if (!brand.name || siteSettings.customBrands.some(b => b.name === brand.name)) return;
    const updated = { ...siteSettings, customBrands: [...siteSettings.customBrands, brand] };
    updateSiteSettings(updated);
  };

  const deleteBrand = (name: string) => {
    const updated = { ...siteSettings, customBrands: siteSettings.customBrands.filter(b => b.name !== name) };
    updateSiteSettings(updated);
  };

  const reorderCollectionBoxes = async (newOrder: string[]) => {
    const updated = { ...siteSettings, collectionBoxOrder: newOrder };
    await updateSiteSettings(updated);
  };

  const addCoupon = (c: Coupon) => {
    setCoupons(prev => [...prev, c]);
    showToast(`Coupon ${c.code} created!`);
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(item => item.code !== code));
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

  // Secure Order Placement: All prices, totals, coupons & stock decrements verified on server
  const placeOrder = async (details: {
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
  }): Promise<Order | null> => {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return null;
    }

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.product.id,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        })),
        shippingAddress: details.shippingAddress,
        paymentMethod: details.paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.order) {
        const createdOrder: Order = data.order;
        setOrders(prev => [createdOrder, ...prev]);
        clearCart();
        setAppliedCoupon(null);
        playAdminChime();

        // Dispatch background notification email
        try {
          fetch('/api/orders/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdOrder),
          }).catch(err => console.warn('Email dispatch error:', err));
        } catch (e) {}

        showToast(`Order ${createdOrder.id} Verified & Created! Total: ₹${createdOrder.total} 🔔`);
        refreshCatalog(); // Refresh stock counts in client
        return createdOrder;
      } else {
        showToast(data.message || 'Order creation failed');
        return null;
      }
    } catch (e) {
      showToast('Network error processing order placement');
      return null;
    }
  };

  // Server-Authorized Product Mutations
  const addProduct = async (p: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'add', product: p }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(prev => [p, ...prev.filter(item => item.id !== p.id)]);
        showToast(`Product "${p.name}" Published Live!`);
      } else {
        showToast(`Server Product Add Error: ${data.message}`);
      }
    } catch (e) {
      showToast('Failed to add product to server');
    }
  };

  const updateProduct = async (updated: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'update', product: updated }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast(`Product "${updated.name}" Updated Live!`);
      } else {
        showToast(`Server Update Error: ${data.message}`);
      }
    } catch (e) {
      showToast('Failed to update product on server');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'delete', product: { id } }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted from server');
      } else {
        showToast(`Server Delete Error: ${data.message}`);
      }
    } catch (e) {
      showToast('Failed to delete product from server');
    }
  };

  const resetProductsToDefault = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'set_all', products: [] }),
      });
      if (res.ok) {
        setProducts([]);
        showToast('Cleared product catalog');
      }
    } catch (e) {}
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
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
        adminToken,
        isLoadingCatalog,
        catalogError,
        adminLogin,
        adminLogout,
        updateSiteSettings,
        reorderCollectionBoxes,
        addCoupon,
        deleteCoupon,
        playAdminChime,
        sendTestEmail,
        forceLockAndSaveAllToCloud,
        addCategory,
        deleteCategory,
        addBrand,
        deleteBrand,
        uploadCustomFont,
        addFooterQuickLink,
        deleteFooterQuickLink,
        reorderFooterQuickLinks,
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
        refreshCatalog,
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
