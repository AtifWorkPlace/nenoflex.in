'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Settings,
  Tag,
  Lock,
  LogOut,
  FileText,
  Volume2,
  Eye,
  Check,
  Layers,
  Upload,
  Type,
  Mail,
  X,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  LayoutGrid,
  ShieldCheck,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductCondition } from '@/types';
import { NotificationSoundType } from '@/lib/audio';
import { compressImageDataUrl } from '@/lib/imageOptimizer';
import { uploadProductImageDirectlyToSupabase } from '@/lib/supabase';

export default function EnterpriseAdminDashboard() {
  const {
    products,
    orders,
    isLoadingOrders,
    ordersError,
    refreshOrders,
    coupons,
    siteSettings,
    isAdmin,
    adminToken,
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
    forceLockAndSaveAllToCloud,
    addCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    uploadCustomFont,
    addFooterQuickLink,
    deleteFooterQuickLink,
    reorderFooterQuickLinks,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    resetProductsToDefault,
    updateOrderStatus,
    showToast,
    refreshCatalog
  } = useStore();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [activeTab, setActiveTab] = useState<'products' | 'catalog' | 'font' | 'promo' | 'sound' | 'banner' | 'coupons' | 'orders' | 'audit'>('products');

  // Form State vs Server State Separation with isDirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Audio Context Unlocking State
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // Site Settings Form State
  const [bannerText, setBannerText] = useState(siteSettings.announcementBanner);
  const [heroTitleText, setHeroTitleText] = useState(siteSettings.heroTitle);
  const [heroSubText, setHeroSubText] = useState(siteSettings.heroSubtitle);
  const [heroCtaText, setHeroCtaText] = useState(siteSettings.heroCtaText || 'Shop now');
  const [heroTickerText, setHeroTickerText] = useState(siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||');

  // 3 Poster Banners Form State
  const [posterTag1, setPosterTag1] = useState(siteSettings.heroPosterTag1 || 'New Drops 🔥');
  const [posterTitle1, setPosterTitle1] = useState(siteSettings.heroPosterTitle1 || 'NEW ARRIVAL');
  const [posterSub1, setPosterSub1] = useState(siteSettings.heroPosterSubtitle1 || 'www.nenoflex.in');
  const [posterLink1, setPosterLink1] = useState(siteSettings.heroPosterLink1 || '/shop?category=New Arrivals');
  const [posterBg1, setPosterBg1] = useState(siteSettings.heroPosterBg1 || '');

  const [posterImg2, setPosterImg2] = useState(siteSettings.heroPosterImage2 || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80');
  const [posterTitle2, setPosterTitle2] = useState(siteSettings.heroPosterTitle2 || 'Jackets / Windcheaters');
  const [posterLink2, setPosterLink2] = useState(siteSettings.heroPosterLink2 || '/shop?category=Jackets');

  const [posterImg3, setPosterImg3] = useState(siteSettings.heroPosterImage3 || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
  const [posterTitle3, setPosterTitle3] = useState(siteSettings.heroPosterTitle3 || 'New Drops Jerseys 🔥 🚀');
  const [posterLink3, setPosterLink3] = useState(siteSettings.heroPosterLink3 || '/shop?category=Jerseys');

  // Footer Quick Links Customizer
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkHref, setNewLinkHref] = useState('');

  // Typography
  const [fontFamilyName, setFontFamilyName] = useState(siteSettings.customFontFamily || 'Inter');
  const [fontFileName, setFontFileName] = useState('');

  // Promo Pop-Up Banner Form
  const [promoEnabled, setPromoEnabled] = useState(siteSettings.promoModal?.enabled ?? true);
  const [promoTitle, setPromoTitle] = useState(siteSettings.promoModal?.title || 'SUMMER DROP 2026');
  const [promoSubtitle, setPromoSubtitle] = useState(siteSettings.promoModal?.subtitle || 'Get up to 90% OFF on imported Nike & TNF Vault Grails!');
  const [promoImage, setPromoImage] = useState(siteSettings.promoModal?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80');
  const [promoBtnText, setPromoBtnText] = useState(siteSettings.promoModal?.buttonText || 'Claim Offer Now');
  const [promoBtnLink, setPromoBtnLink] = useState(siteSettings.promoModal?.buttonLink || '/shop');

  // Sound Engine Form
  const [selectedSound, setSelectedSound] = useState<NotificationSoundType>(siteSettings.notificationSound || 'cash-register');

  // Footer Form
  const [footerTagline, setFooterTagline] = useState(siteSettings.footerTagline);
  const [footerPhone, setFooterPhone] = useState(siteSettings.footerPhone);
  const [footerWhatsappUrl, setFooterWhatsappUrl] = useState(siteSettings.footerWhatsappUrl || 'https://wa.me/916000149919');
  const [footerInstagram, setFooterInstagram] = useState(siteSettings.footerInstagram);
  const [footerInstagramUrl, setFooterInstagramUrl] = useState(siteSettings.footerInstagramUrl || 'https://instagram.com/flexnagaon');
  const [footerCopyright, setFooterCopyright] = useState(siteSettings.footerCopyright || '© 2022 NenoFlex Official. All rights reserved.');
  const [smtpPassSecret, setSmtpPassSecret] = useState('');

  // New Category & Brand Form
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('✨');
  const [newBrandOrigin, setNewBrandOrigin] = useState('Japan');

  // Navbar Nav Links Editor State
  const DEFAULT_NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Sweatshirts', href: '/shop?category=Sweatshirts' },
    { label: 'Jerseys', href: '/shop?category=Jerseys' },
    { label: 'Jackets', href: '/shop?category=Jackets' },
    { label: 'Hoodies', href: '/shop?category=Hoodies' },
    { label: 'Shop All', href: '/shop?category=All' },
  ];
  const [navLinksLocal, setNavLinksLocal] = useState<Array<{ label: string; href: string }>>(
    siteSettings.navLinks && siteSettings.navLinks.length > 0 ? siteSettings.navLinks : DEFAULT_NAV_LINKS
  );
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');
  const [editingNavIdx, setEditingNavIdx] = useState<number | null>(null);
  const [editNavLabel, setEditNavLabel] = useState('');
  const [editNavHref, setEditNavHref] = useState('');
  const [isSavingNav, setIsSavingNav] = useState(false);

  const saveNavLinks = async (links: Array<{ label: string; href: string }>) => {
    setIsSavingNav(true);
    await updateSiteSettings({ ...siteSettings, navLinks: links });
    setIsSavingNav(false);
    showToast('Navbar links saved!');
  };

  const addNavLink = () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) return;
    const updated = [...navLinksLocal, { label: newNavLabel.trim(), href: newNavHref.trim() }];
    setNavLinksLocal(updated);
    saveNavLinks(updated);
    setNewNavLabel('');
    setNewNavHref('');
  };

  const deleteNavLink = (idx: number) => {
    const updated = navLinksLocal.filter((_, i) => i !== idx);
    setNavLinksLocal(updated);
    saveNavLinks(updated);
  };

  const moveNavLink = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= navLinksLocal.length) return;
    const updated = [...navLinksLocal];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setNavLinksLocal(updated);
    saveNavLinks(updated);
  };

  const startEditNavLink = (idx: number) => {
    setEditingNavIdx(idx);
    setEditNavLabel(navLinksLocal[idx].label);
    setEditNavHref(navLinksLocal[idx].href);
  };

  const saveEditNavLink = () => {
    if (editingNavIdx === null) return;
    const updated = navLinksLocal.map((l, i) =>
      i === editingNavIdx ? { label: editNavLabel.trim(), href: editNavHref.trim() } : l
    );
    setNavLinksLocal(updated);
    saveNavLinks(updated);
    setEditingNavIdx(null);
  };

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  // ── PUSH NOTIFICATION STATE ──
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'loading'>('loading');
  const [pushRegistered, setPushRegistered] = useState(false);
  const [pushDeviceCount, setPushDeviceCount] = useState(0);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushTestLoading, setPushTestLoading] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  // Register service worker and check push status on admin login
  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const initPush = async () => {
      try {
        // 1. Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        // 2. Check current permission
        const perm = Notification.permission;
        setPushPermission(perm);

        if (perm === 'default') {
          // Show setup prompt if not yet decided
          const dismissed = sessionStorage.getItem('nf_push_prompt_dismissed');
          if (!dismissed) setShowPushPrompt(true);
        }

        if (perm === 'granted') {
          // Check if already subscribed
          const existing = await reg.pushManager.getSubscription();
          if (existing) {
            setCurrentEndpoint(existing.endpoint);
            setPushRegistered(true);
            // Fetch device count from server
            const res = await fetch('/api/admin/notifications/status', {
              headers: { 'Authorization': `Bearer ${adminToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              setPushDeviceCount(data.deviceCount || 0);
            }
          }
        }
      } catch (err) {
        console.warn('[Push Init]:', err);
      } finally {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPushPermission(Notification.permission);
        }
      }
    };

    initPush();
  }, [isAdmin, adminToken]);

  const enablePushNotifications = async () => {
    if (!adminToken) return;
    setPushLoading(true);
    setShowPushPrompt(false);
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== 'granted') {
        showToast('Notification permission denied. Enable it in browser settings.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { showToast('VAPID key not configured'); return; }

      // Convert VAPID public key to Uint8Array
      const keyBytes = Uint8Array.from(atob(vapidKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes,
      });

      setCurrentEndpoint(subscription.endpoint);

      // Register on server
      const res = await fetch('/api/admin/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ subscription }),
      });

      const data = await res.json();
      if (data.success) {
        setPushRegistered(true);
        setPushDeviceCount(data.deviceCount || 1);
        showToast('🔔 Push notifications enabled!');
      } else {
        showToast('Failed to register device: ' + data.message);
      }
    } catch (err: any) {
      showToast('Push setup error: ' + (err?.message || 'Unknown'));
    } finally {
      setPushLoading(false);
    }
  };

  const disablePushNotifications = async () => {
    if (!currentEndpoint || !adminToken) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await fetch('/api/admin/notifications/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ endpoint: currentEndpoint }),
      });

      setPushRegistered(false);
      setCurrentEndpoint(null);
      setPushDeviceCount(prev => Math.max(0, prev - 1));
      showToast('🔕 Push notifications disabled for this device.');
    } catch (err: any) {
      showToast('Error disabling: ' + err?.message);
    } finally {
      setPushLoading(false);
    }
  };

  const sendTestPushNotification = async () => {
    if (!adminToken) return;
    setPushTestLoading(true);
    try {
      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Test notification sent to ${data.sent} device${data.sent !== 1 ? 's' : ''}!`);
      } else {
        showToast('Test failed: ' + data.message);
      }
    } catch (err: any) {
      showToast('Test error: ' + err?.message);
    } finally {
      setPushTestLoading(false);
    }
  };

  // Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Synchronize form state with siteSettings only when form is NOT dirty
  useEffect(() => {
    if (!isDirty) {
      setBannerText(siteSettings.announcementBanner);
      setHeroTitleText(siteSettings.heroTitle);
      setHeroSubText(siteSettings.heroSubtitle);
      setHeroCtaText(siteSettings.heroCtaText || 'Shop now');
      setHeroTickerText(siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||');
      setPosterTag1(siteSettings.heroPosterTag1 || 'New Drops 🔥');
      setPosterTitle1(siteSettings.heroPosterTitle1 || 'NEW ARRIVAL');
      setPosterSub1(siteSettings.heroPosterSubtitle1 || 'www.nenoflex.in');
      setPosterLink1(siteSettings.heroPosterLink1 || '/shop?category=New Arrivals');
      setPosterBg1(siteSettings.heroPosterBg1 || '');
      setPosterImg2(siteSettings.heroPosterImage2 || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80');
      setPosterTitle2(siteSettings.heroPosterTitle2 || 'Jackets / Windcheaters');
      setPosterLink2(siteSettings.heroPosterLink2 || '/shop?category=Jackets');
      setPosterImg3(siteSettings.heroPosterImage3 || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
      setPosterTitle3(siteSettings.heroPosterTitle3 || 'New Drops Jerseys 🔥 🚀');
      setPosterLink3(siteSettings.heroPosterLink3 || '/shop?category=Jerseys');
      setFooterTagline(siteSettings.footerTagline);
      setFooterPhone(siteSettings.footerPhone);
      setFooterWhatsappUrl(siteSettings.footerWhatsappUrl || 'https://wa.me/916000149919');
      setFooterInstagram(siteSettings.footerInstagram);
      setFooterInstagramUrl(siteSettings.footerInstagramUrl || 'https://instagram.com/flexnagaon');
      setFooterCopyright(siteSettings.footerCopyright || '© 2022 NenoFlex Official. All rights reserved.');
      setFontFamilyName(siteSettings.customFontFamily || 'Inter');
    }
  }, [siteSettings, isDirty]);

  const unlockAudioContext = () => {
    playAdminChime();
    setIsAudioUnlocked(true);
    showToast('Audio Notification Context Unlocked 🔊');
  };

  const getCleanProductTemplate = (): Partial<Product> => ({
    sku: `SKU-NF-${Math.floor(100 + Math.random() * 900)}`,
    barcode: `890123${Math.floor(1000000 + Math.random() * 9000000)}`,
    name: '',
    brand: 'Nike',
    category: 'Sweatshirts',
    collection: ['Vintage Collection', 'Streetwear Collection'],
    price: 899,
    showroomPrice: 8999,
    discountPercent: 90,
    conditionScore: 9.8,
    conditionGrade: 'Mint (9.8-10)',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    material: '100% Cotton Fleece',
    weight: '650g',
    fit: 'Boxy Fit',
    description: 'Handpicked Tokyo thrift import.',
    authenticitySeal: true,
    sanitized: true,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    imageHover: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'
    ],
    isNewArrival: true,
    isTrending: true,
    isBestSeller: false,
    isLimited: true,
    stockCount: 3,
    rating: 5.0,
    reviewsCount: 12,
    tags: ['nike', 'sweatshirt', 'black', 'vintage'],
  });

  const [newProd, setNewProd] = useState<Partial<Product>>(getCleanProductTemplate());

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    const success = await adminLogin(loginEmail, loginPassword);
    setIsSubmittingAuth(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] bg-black text-white flex items-center justify-center py-16 px-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border border-neutral-800 bg-neutral-950 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase font-mono text-white">NenoFlex Admin Gateway</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Sign in with authorized administrator credentials to access the executive command center.
            </p>
          </div>

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1">Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@nenoflex.com"
                className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg cursor-pointer disabled:opacity-50 font-mono"
            >
              {isSubmittingAuth ? 'Verifying Session...' : 'Sign In To Admin Console'}
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 font-mono">
            Protected by Server JWT Tokens & Supabase Row Level Security.
          </p>
        </div>
      </div>
    );
  }

  // Device Poster Image Upload Handler (Direct Supabase Storage CDN)
  const handleDevicePosterUpload = async (file: File, posterIndex: 1 | 2 | 3) => {
    if (!file) return;
    setIsDirty(true);
    showToast(`Uploading Poster ${posterIndex} image to Supabase Storage...`);
    const res = await uploadProductImageDirectlyToSupabase(file, adminToken, `poster-${posterIndex}`);
    
    if (!res.success || !res.url) {
      showToast(`❌ Poster Upload Failed: ${res.error || 'Upload error'}`);
      return;
    }

    if (posterIndex === 1) setPosterBg1(res.url);
    else if (posterIndex === 2) setPosterImg2(res.url);
    else if (posterIndex === 3) setPosterImg3(res.url);
    showToast(`Poster ${posterIndex} uploaded! Click "Save Settings" to publish.`);
  };

  // Device Promo Image Upload Handler (Direct Supabase Storage CDN)
  const handleDevicePromoUpload = async (file: File) => {
    if (!file) return;
    setIsDirty(true);
    showToast('Uploading Promo image to Supabase Storage...');
    const res = await uploadProductImageDirectlyToSupabase(file, adminToken, 'promo');
    
    if (!res.success || !res.url) {
      showToast(`❌ Promo Upload Failed: ${res.error || 'Upload error'}`);
      return;
    }

    setPromoImage(res.url);
    showToast('Promo image uploaded successfully to Supabase Storage!');
  };

  // Multi-File Product Image Upload Handler (Direct Supabase Storage CDN)
  const handleMultiDeviceImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const currentGallery = editingProduct ? (editingProduct.gallery || []) : (newProd.gallery || []);
    const remainingSlots = 10 - currentGallery.length;

    if (remainingSlots <= 0) {
      showToast('Maximum 10 images limit reached!');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    showToast(`Uploading ${filesToUpload.length} image(s) to Supabase Storage CDN...`);

    const newImageUrls: string[] = [];
    const prefix = editingProduct ? editingProduct.id : 'new-prod';

    for (const file of filesToUpload) {
      const res = await uploadProductImageDirectlyToSupabase(file, adminToken, prefix);
      if (res.success && res.url) {
        newImageUrls.push(res.url);
      } else {
        showToast(`❌ Image "${file.name}" Upload Failed: ${res.error || 'Storage upload error'}`);
      }
    }

    if (newImageUrls.length > 0) {
      const updatedGallery = [...currentGallery, ...newImageUrls].slice(0, 10);
      const primary: string = updatedGallery[0] || (editingProduct ? editingProduct.image : newProd.image) || '';
      const hover: string = updatedGallery[1] || primary;

      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image: primary,
          imageHover: hover,
          gallery: updatedGallery,
        });
      } else {
        setNewProd(prev => ({
          ...prev,
          image: primary,
          imageHover: hover,
          gallery: updatedGallery,
        }));
      }
      showToast(`Successfully uploaded ${newImageUrls.length} image(s) to Supabase Storage CDN!`);
    }
  };

  const removeGalleryImage = (index: number) => {
    if (editingProduct) {
      const updatedGallery = editingProduct.gallery.filter((_, i) => i !== index);
      setEditingProduct({
        ...editingProduct,
        image: updatedGallery[0] || editingProduct.image,
        imageHover: updatedGallery[1] || updatedGallery[0] || editingProduct.imageHover,
        gallery: updatedGallery,
      });
    } else {
      const updatedGallery = (newProd.gallery || []).filter((_, i) => i !== index);
      setNewProd(prev => ({
        ...prev,
        image: updatedGallery[0] || prev.image,
        imageHover: updatedGallery[1] || updatedGallery[0] || prev.imageHover,
        gallery: updatedGallery,
      }));
    }
  };

  const handleDeviceFontFileUpload = (file: File) => {
    if (!file) return;
    const cleanFontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
    setFontFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const fontDataUrl = e.target?.result as string;
      uploadCustomFont(cleanFontName, fontDataUrl);
      setFontFamilyName(cleanFontName);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSiteSettings({
      ...siteSettings,
      announcementBanner: bannerText,
      heroTitle: heroTitleText,
      heroSubtitle: heroSubText,
      heroCtaText,
      heroTickerText,
      heroPosterTag1: posterTag1,
      heroPosterTitle1: posterTitle1,
      heroPosterSubtitle1: posterSub1,
      heroPosterLink1: posterLink1,
      heroPosterBg1: posterBg1,
      heroPosterImage2: posterImg2,
      heroPosterTitle2: posterTitle2,
      heroPosterLink2: posterLink2,
      heroPosterImage3: posterImg3,
      heroPosterTitle3: posterTitle3,
      heroPosterLink3: posterLink3,
      footerTagline,
      footerPhone,
      footerWhatsappUrl,
      footerInstagram,
      footerInstagramUrl,
      footerCopyright,
      customFontFamily: fontFamilyName,
    });
    setIsDirty(false);
    setIsSaving(false);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSiteSettings({
      ...siteSettings,
      promoModal: {
        enabled: promoEnabled,
        title: promoTitle,
        subtitle: promoSubtitle,
        image: promoImage,
        buttonText: promoBtnText,
        buttonLink: promoBtnLink,
      }
    });
    setIsDirty(false);
    setIsSaving(false);
    showToast(`Promo Banner ${promoEnabled ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleSaveSound = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSiteSettings({
      ...siteSettings,
      notificationSound: selectedSound,
    });
    setIsDirty(false);
    setIsSaving(false);
    playAdminChime(selectedSound);
    showToast(`Order Notification Sound set to "${selectedSound.toUpperCase()}"`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    addCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountPercent: Number(newCouponDiscount),
    });
    setNewCouponCode('');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (editingProduct) {
      await updateProduct(editingProduct);
      setEditingProduct(null);
    } else {
      const title = newProd.name && newProd.name.trim().length > 0 ? newProd.name.trim() : 'Custom Vintage Vault Item';
      const fullProduct: Product = {
        ...getCleanProductTemplate(),
        ...newProd,
        name: title,
        id: `nf-${Date.now()}`,
        gallery: newProd.gallery && newProd.gallery.length > 0 ? newProd.gallery : [newProd.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
      } as Product;
      await addProduct(fullProduct);
      setNewProd(getCleanProductTemplate());
      setShowAddModal(false);
    }
    setIsSaving(false);
  };

  // Re-align Homepage Showcase Sections
  const currentSections = siteSettings.collectionBoxOrder || ['bento-banner', 'jerseys', 'jackets-fleeces', 'brands'];

  const getSectionName = (secId: string) => {
    switch (secId) {
      case 'bento-banner':
        return 'New Arrivals (Bento 3 Poster Banners)';
      case 'jerseys':
        return 'New Drops Jerseys 🔥 🚀 Section';
      case 'jackets-fleeces':
        return 'Vintage Fleeces & Vault Grails (Jackets)';
      case 'brands':
        return 'Handpicked Vault Brands Showcase';
      default:
        return secId;
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...currentSections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    reorderCollectionBoxes(list);
  };

  // Footer Links Re-align
  const currentFooterLinks = siteSettings.footerQuickLinks || [];

  const moveFooterLink = (index: number, direction: 'up' | 'down') => {
    const list = [...currentFooterLinks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    reorderFooterQuickLinks(list);
  };

  const activeGallery = editingProduct ? (editingProduct.gallery || []) : (newProd.gallery || []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-black border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
              ROLE: {userRole.toUpperCase()} (AUTHENTICATED SESSION)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> SUPABASE CLOUD AUTHORITATIVE DB
            </span>
            {!isAudioUnlocked && (
              <button
                onClick={unlockAudioContext}
                className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <VolumeX className="w-3 h-3 text-rose-400" /> Unlock Audio Context
              </button>
            )}
          </div>
          <h1 className="luxury-heading text-2xl sm:text-3xl font-bold text-white mt-2">
            NenoFlex Executive Command Center
          </h1>
          <p className="text-xs text-neutral-400">Server-authorized CRUD, live stock concurrency & Cloud Database Management.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* ── PUSH NOTIFICATION WIDGET ── */}
          {typeof window !== 'undefined' && 'Notification' in window ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-neutral-900 border border-neutral-800">
              {pushPermission === 'loading' ? (
                <span className="text-[10px] font-mono text-neutral-500 animate-pulse">Checking...</span>
              ) : pushPermission === 'denied' ? (
                <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">🔕 Notifications blocked — enable in browser settings</span>
              ) : pushRegistered ? (
                <>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    🔔 CONNECTED
                    {pushDeviceCount > 0 && <span className="text-neutral-500">({pushDeviceCount} device{pushDeviceCount !== 1 ? 's' : ''})</span>}
                  </span>
                  <button
                    onClick={sendTestPushNotification}
                    disabled={pushTestLoading}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors disabled:opacity-50"
                    title="Send test push to all your devices"
                  >
                    {pushTestLoading ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={disablePushNotifications}
                    disabled={pushLoading}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 text-[10px] font-mono cursor-pointer transition-colors"
                    title="Disable notifications on this device"
                  >
                    Disable
                  </button>
                </>
              ) : (
                <button
                  onClick={enablePushNotifications}
                  disabled={pushLoading}
                  className="text-[10px] font-mono text-amber-400 hover:text-white font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {pushLoading ? 'Enabling...' : '🔔 Enable Notifications'}
                </button>
              )}
            </div>
          ) : null}

          <button
            onClick={forceLockAndSaveAllToCloud}
            disabled={isSaving}
            className="px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase transition-all flex items-center gap-2 shadow-lg cursor-pointer font-mono disabled:opacity-50"
          >
            <Lock className="w-4 h-4" /> {isSaving ? 'PERSISTING TO CLOUD...' : 'LOCK & SYNC ALL DATA TO CLOUD'}
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setNewProd(getCleanProductTemplate());
              setShowAddModal(true);
            }}
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" /> Add Product Live
          </button>
          <button
            onClick={adminLogout}
            className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── ONE-TIME PUSH SETUP PROMPT ── */}
      {showPushPrompt && pushPermission === 'default' && (
        <div className="p-4 rounded-2xl bg-black border border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-white font-bold text-sm font-mono">Order Notifications</p>
              <p className="text-neutral-400 text-xs mt-0.5">Get instant phone alerts when a customer places a new NenoFlex order.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={enablePushNotifications}
              disabled={pushLoading}
              className="px-5 py-2.5 rounded-full bg-[#CCFF00] text-black font-bold text-xs uppercase font-mono cursor-pointer hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {pushLoading ? 'Setting up...' : '⚡ Enable Notifications'}
            </button>
            <button
              onClick={() => { setShowPushPrompt(false); sessionStorage.setItem('nf_push_prompt_dismissed', '1'); }}
              className="px-4 py-2.5 rounded-full bg-neutral-800 text-neutral-400 font-bold text-xs uppercase font-mono cursor-pointer hover:bg-neutral-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Form state modified. External background updates are currently locked to protect your edits.</span>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-1.5 rounded-full bg-amber-400 text-black font-bold uppercase text-[10px]"
          >
            Save Changes Now
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-800 overflow-x-auto">
        {[
          { id: 'products', label: `1. Products Catalog (${products.length})`, icon: Package },
          { id: 'catalog', label: '2. Catalog Categories & Brands', icon: Layers },
          { id: 'font', label: '3. Device Font Customizer', icon: Type },
          { id: 'promo', label: '4. Promo Pop-up Banner', icon: Eye },
          { id: 'sound', label: '5. Order Sound Chime', icon: Volume2 },
          { id: 'banner', label: '6. Sections Layout, Poster Photos & Footer Customizer', icon: Settings },
          { id: 'coupons', label: `7. Coupons (${coupons.length})`, icon: Tag },
          { id: 'orders', label: `8. Orders (${orders.length})`, icon: TrendingUp },
          { id: 'audit', label: `9. Audit Logs (${auditLogs.length})`, icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                active ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-mono uppercase font-bold text-white">Vault Products Directory (Supabase Cloud Authoritative)</h2>
              <p className="text-xs text-neutral-400">All product additions, edits, and deletions require server admin authentication.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetProductsToDefault}
                className="px-3.5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                title="Clear catalog"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Catalog
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProd(getCleanProductTemplate());
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> New Product
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-black border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Condition Grade</th>
                  <th className="py-3 px-4">Gallery</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500 font-mono text-xs">
                      Catalog is empty. Click <strong className="text-white">"+ New Product"</strong> to add your first live product!
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-900 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                        <div>{p.sku}</div>
                        <div className="text-[9px] text-neutral-500">{p.barcode}</div>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3 font-semibold text-white">
                        <img src={p.image} alt="Thumb" className="w-10 h-12 object-cover rounded-lg bg-neutral-900" />
                        <span className="truncate max-w-xs">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{p.brand}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">₹{p.price}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                        {p.conditionScore} / 10 ({p.conditionGrade})
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-amber-400">
                        {(p.gallery || []).length} / 10 imgs
                      </td>
                      <td className="py-3 px-4 font-mono">{p.stockCount}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateProductStock(p.id, p.stockCount > 0 ? 0 : 2)}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase cursor-pointer ${
                            p.stockCount <= 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {p.stockCount <= 0 ? 'SOLD OUT' : 'IN STOCK'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG CATEGORIES & BRANDS */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">

          {/* ── NAVBAR NAVIGATION LINKS MANAGER ── */}
          <div className="p-6 rounded-3xl bg-black border border-[#CCFF00]/20 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-mono uppercase text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#CCFF00]" />
                  Navbar Navigation Links
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Add, edit, reorder, or delete the links shown in the site header. Changes go live instantly.</p>
              </div>
              {isSavingNav && <span className="text-[10px] font-mono text-[#CCFF00] animate-pulse">Saving...</span>}
            </div>

            {/* Live Preview Strip */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto scrollbar-none">
              <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest shrink-0">Live Preview:</span>
              {navLinksLocal.map((link, i) => (
                <span key={i} className="text-[11px] font-mono font-bold text-white shrink-0 border-b border-white/20 pb-0.5">{link.label}</span>
              ))}
            </div>

            {/* Existing Nav Links List */}
            <div className="space-y-2">
              {navLinksLocal.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveNavLink(idx, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveNavLink(idx, 1)}
                      disabled={idx === navLinksLocal.length - 1}
                      className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Edit Inline or Display */}
                  {editingNavIdx === idx ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        value={editNavLabel}
                        onChange={e => setEditNavLabel(e.target.value)}
                        placeholder="Label"
                        className="w-28 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
                      />
                      <input
                        value={editNavHref}
                        onChange={e => setEditNavHref(e.target.value)}
                        placeholder="/shop?category=..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
                      />
                      <button
                        onClick={saveEditNavLink}
                        className="px-3 py-1.5 rounded-lg bg-[#CCFF00] text-black text-xs font-bold cursor-pointer hover:bg-white transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNavIdx(null)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white text-xs font-bold cursor-pointer hover:bg-neutral-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <span className="text-white font-bold text-xs font-mono w-28 shrink-0 truncate">{link.label}</span>
                      <span className="text-neutral-500 text-xs font-mono truncate flex-1">{link.href}</span>
                      <button
                        onClick={() => startEditNavLink(idx)}
                        className="shrink-0 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteNavLink(idx)}
                    className="shrink-0 p-1.5 rounded-lg bg-neutral-800 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Nav Link */}
            <div className="flex gap-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                value={newNavLabel}
                onChange={e => setNewNavLabel(e.target.value)}
                placeholder="Label (e.g. Caps)"
                className="w-36 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
              />
              <input
                type="text"
                value={newNavHref}
                onChange={e => setNewNavHref(e.target.value)}
                placeholder="/shop?category=Caps"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
                onKeyDown={e => e.key === 'Enter' && addNavLink()}
              />
              <button
                onClick={addNavLink}
                disabled={!newNavLabel.trim() || !newNavHref.trim()}
                className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase cursor-pointer hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>
          </div>

          {/* ── CATEGORIES & BRANDS (2-col grid) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4">
              <h3 className="font-bold text-sm font-mono uppercase text-white">Customize Catalog Categories</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => {
                    setNewCatName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="New Category Name (e.g. Vintage Denim)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                />
                <button
                  onClick={() => {
                    if (newCatName) {
                      addCategory(newCatName);
                      setNewCatName('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase cursor-pointer"
                >
                  Add Category
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-400 font-mono max-h-96 overflow-y-auto">
                {siteSettings.customCategories.map(cat => (
                  <div key={cat} className="flex justify-between items-center p-2.5 rounded-xl bg-neutral-900">
                    <span className="text-white font-bold">{cat}</span>
                    <button
                      onClick={() => deleteCategory(cat)}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4">
              <h3 className="font-bold text-sm font-mono uppercase text-white">Customize Luxury & Streetwear Brands</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={e => {
                    setNewBrandName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Brand Name (e.g. Stüssy)"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrandLogo}
                    onChange={e => setNewBrandLogo(e.target.value)}
                    placeholder="Emoji"
                    className="w-20 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={newBrandOrigin}
                    onChange={e => setNewBrandOrigin(e.target.value)}
                    placeholder="Origin Country"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => {
                      if (newBrandName) {
                        addBrand({ name: newBrandName, logo: newBrandLogo, origin: newBrandOrigin });
                        setNewBrandName('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase cursor-pointer"
                  >
                    Add Brand
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-400 font-mono max-h-96 overflow-y-auto">
                {siteSettings.customBrands.map(b => (
                  <div key={b.name} className="flex justify-between items-center p-2.5 rounded-xl bg-neutral-900">
                    <span className="text-white font-bold">{b.logo} {b.name} ({b.origin})</span>
                    <button
                      onClick={() => deleteBrand(b.name)}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TYPOGRAPHY & FONT UPLOADER */}
      {activeTab === 'font' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase">Site-Wide Typography & Font Uploader Engine</h2>
            <p className="text-xs text-neutral-400 mt-1">Upload font files (.ttf, .otf, .woff, .woff2) directly from your device or select font presets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm text-amber-400 uppercase">1. Select Typography Preset</h3>
              <div className="space-y-2">
                {[
                  { id: 'Inter', name: 'Inter (Default Modern Minimalist)' },
                  { id: 'Outfit', name: 'Outfit (Luxury Streetwear Sans)' },
                  { id: 'Playfair Display', name: 'Playfair Display (Serif Elegance)' },
                  { id: 'Bebas Neue', name: 'Bebas Neue (Bold Streetwear Header)' },
                  { id: 'Courier New', name: 'Courier New (Tech Monospace Vault)' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontFamilyName(f.id);
                      updateSiteSettings({ ...siteSettings, customFontFamily: f.id, customFontDataUrl: undefined });
                      showToast(`Applied "${f.name}" site-wide!`);
                    }}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                      siteSettings.customFontFamily === f.id
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                        : 'bg-black border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span>{f.name}</span>
                    {siteSettings.customFontFamily === f.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs font-mono">
              <h3 className="font-bold text-sm text-emerald-400 uppercase">2. Upload Font File From Device 📁</h3>
              <p className="text-neutral-400 leading-relaxed">
                Upload custom font files (<strong className="text-white">.ttf, .otf, .woff, .woff2</strong>) from your computer or phone.
              </p>

              <div className="p-4 rounded-xl bg-black border border-neutral-800 text-center space-y-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-all shadow-lg">
                  <Upload className="w-4 h-4" /> Select Font File from Device
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleDeviceFontFileUpload(e.target.files[0])}
                  />
                </label>

                {fontFileName && (
                  <p className="text-xs text-emerald-400 font-bold pt-1">
                    Uploaded: {fontFileName} (Applied Live ✓)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROMO POP-UP BANNER MANAGER */}
      {activeTab === 'promo' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase">Homepage Promo Pop-up Banner Manager</h2>
              <p className="text-xs text-neutral-400 mt-1">Configure full-stake matte black homepage promo banner & ON/OFF toggle.</p>
            </div>
            <button
              onClick={() => {
                const nextState = !promoEnabled;
                setPromoEnabled(nextState);
                setIsDirty(true);
              }}
              className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                promoEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              STATUS: {promoEnabled ? 'ON (VISIBLE)' : 'OFF (HIDDEN)'}
            </button>
          </div>

          <form onSubmit={handleSavePromo} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-400 font-mono mb-1">Banner Title</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={e => {
                    setPromoTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Subtitle / Offer Description</label>
                <textarea
                  value={promoSubtitle}
                  onChange={e => {
                    setPromoSubtitle(e.target.value);
                    setIsDirty(true);
                  }}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Banner Image (Upload From Device or URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoImage}
                    onChange={e => {
                      setPromoImage(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Image URL or Base64 Data"
                    className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                  <label className="cursor-pointer px-4 py-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center gap-1.5 shrink-0 shadow-lg hover:bg-neutral-200">
                    <Upload className="w-3.5 h-3.5" /> Device Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleDevicePromoUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={promoBtnText}
                    onChange={e => {
                      setPromoBtnText(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Button CTA Link</label>
                  <input
                    type="text"
                    value={promoBtnLink}
                    onChange={e => {
                      setPromoBtnLink(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer disabled:opacity-50 font-mono"
              >
                {isSaving ? 'Saving...' : 'Save Promo Pop-up Settings'}
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#171717] border border-white/20 text-white space-y-4 shadow-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">LIVE PREVIEW</span>
              <img src={promoImage} alt="Preview" className="w-full h-48 object-cover rounded-2xl bg-neutral-900" />
              <div>
                <h3 className="text-xl font-bold text-white uppercase">{promoTitle}</h3>
                <p className="text-xs text-neutral-300 mt-1">{promoSubtitle}</p>
              </div>
              <button className="w-full py-3 rounded-full bg-white text-black font-bold text-xs uppercase">
                {promoBtnText}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: ORDER SOUND CHIME SELECTOR */}
      {activeTab === 'sound' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase">Order Push Notification Sound Chime Engine</h2>
              <p className="text-xs text-neutral-400 mt-1">Synthesized Web Audio API chimes triggered live whenever a customer completes an order.</p>
            </div>
            {!isAudioUnlocked && (
              <button
                onClick={unlockAudioContext}
                className="px-4 py-2 rounded-full bg-amber-500 text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Click to Unlock Browser Audio
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'cash-register', name: 'Cash Register Chime 💸', desc: 'Upbeat luxury register bell sound' },
              { id: 'luxury-bell', name: 'Luxury Bell 🔔', desc: 'Resonant executive crystal chime' },
              { id: 'ping', name: 'Subtle Ping ⚡', desc: 'Minimalist high-tech pulse alert' },
              { id: 'alert', name: 'Executive Alert 🚨', desc: 'Dual-tone VIP notification' },
            ].map(sound => (
              <div
                key={sound.id}
                onClick={() => {
                  setSelectedSound(sound.id as any);
                  setIsDirty(true);
                  playAdminChime(sound.id as any);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedSound === sound.id
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{sound.name}</h4>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{sound.desc}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAdminChime(sound.id as any);
                  }}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Test Sound
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSound}
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer disabled:opacity-50 font-mono"
          >
            {isSaving ? 'Saving...' : 'Save Sound Chime Preference'}
          </button>
        </div>
      )}

      {/* TAB 6: UNIFIED HOMEPAGE SECTIONS & FOOTER QUICK LINKS MANAGER */}
      {activeTab === 'banner' && (
        <div className="space-y-8 font-sans">
          {/* Section 1: Homepage Showcase Sections Re-aligning Manager */}
          <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase text-amber-400 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" /> Homepage Showcase Sections Manager (Re-align with [ ↑ ] & [ ↓ ])
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Re-align the order of all homepage sections using <strong className="text-amber-400">[ ↑ Move Up ]</strong> and <strong className="text-amber-400">[ ↓ Move Down ]</strong>.
              </p>
            </div>

            <div className="space-y-3 max-w-3xl">
              {currentSections.map((secId, idx) => (
                <div
                  key={secId}
                  className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white text-sm">{getSectionName(secId)}</span>
                      <span className="text-[10px] text-neutral-500 block font-mono">ID: {secId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-amber-400 border border-neutral-700 disabled:opacity-30 cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <ArrowUp className="w-3.5 h-3.5" /> Move Up
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === currentSections.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-amber-400 border border-neutral-700 disabled:opacity-30 cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <ArrowDown className="w-3.5 h-3.5" /> Move Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 3 Bento Poster Banners Image & Title Customizer */}
          <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Bento Poster Banners & New Arrivals Image Customizer
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload poster photos directly from your device for Poster 1 (New Arrivals), Poster 2 (Jackets), and Poster 3 (Jerseys).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster Box 1: New Arrivals */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-3">
                  <h3 className="font-bold text-sm text-amber-400 font-mono uppercase">Poster 1: New Arrivals</h3>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Tag Text</label>
                    <input
                      type="text"
                      value={posterTag1}
                      onChange={e => {
                        setPosterTag1(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Title Text</label>
                    <input
                      type="text"
                      value={posterTitle1}
                      onChange={e => {
                        setPosterTitle1(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Subtitle Text</label>
                    <input
                      type="text"
                      value={posterSub1}
                      onChange={e => {
                        setPosterSub1(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-mono"
                    />
                  </div>

                  {/* Device Image Uploader for Poster 1 */}
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Background Image</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 1 Photo 📁
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleDevicePosterUpload(e.target.files[0], 1)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={posterBg1}
                        onChange={e => {
                          setPosterBg1(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Or paste image URL"
                        className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Link Redirect URL</label>
                    <input
                      type="text"
                      value={posterLink1}
                      onChange={e => {
                        setPosterLink1(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-emerald-400 font-mono"
                    />
                  </div>
                </div>

                {/* Poster Box 2: Jackets / Windcheaters */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h3 className="font-bold text-sm text-white font-mono uppercase">Poster 2: Jackets / Windcheaters</h3>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Poster Photo</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 2 Photo 📁
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleDevicePosterUpload(e.target.files[0], 2)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={posterImg2}
                        onChange={e => {
                          setPosterImg2(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Or paste image URL"
                        className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Button Title</label>
                    <input
                      type="text"
                      value={posterTitle2}
                      onChange={e => {
                        setPosterTitle2(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Link Redirect URL</label>
                    <input
                      type="text"
                      value={posterLink2}
                      onChange={e => {
                        setPosterLink2(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Poster Box 3: New Drops Jerseys 🔥 🚀 */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h3 className="font-bold text-sm text-white font-mono uppercase">Poster 3: New Drops Jerseys</h3>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Poster Photo</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 3 Photo 📁
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleDevicePosterUpload(e.target.files[0], 3)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={posterImg3}
                        onChange={e => {
                          setPosterImg3(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Or paste image URL"
                        className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Button Title</label>
                    <input
                      type="text"
                      value={posterTitle3}
                      onChange={e => {
                        setPosterTitle3(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Link Redirect URL</label>
                    <input
                      type="text"
                      value={posterLink3}
                      onChange={e => {
                        setPosterLink3(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Continuous Moving Ticker Banner Text</label>
                <input
                  type="text"
                  value={heroTickerText}
                  onChange={e => {
                    setHeroTickerText(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-400 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={footerPhone}
                    onChange={e => {
                      setFooterPhone(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">WhatsApp Redirect Link URL</label>
                  <input
                    type="text"
                    value={footerWhatsappUrl}
                    onChange={e => {
                      setFooterWhatsappUrl(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-emerald-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={footerInstagram}
                    onChange={e => {
                      setFooterInstagram(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Instagram Redirect Link URL</label>
                  <input
                    type="text"
                    value={footerInstagramUrl}
                    onChange={e => {
                      setFooterInstagramUrl(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-pink-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={e => {
                    setFooterCopyright(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer shadow-lg disabled:opacity-50 font-mono"
              >
                {isSaving ? 'Saving...' : 'Save All Layout & Settings Live Globally'}
              </button>
            </form>
          </div>

          {/* Section 3: Footer Quick Links List Re-align & Customizer */}
          <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase text-emerald-400 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" /> Footer Quick Links Manager (Add, Delete & Re-align Links)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Customize the Footer Quick Links ("New Arrivals", "New Drops 🔥", "Vintage Fleeces & Vault Grails").
              </p>
            </div>

            {/* Add New Quick Link Form */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-xs font-mono text-white uppercase">Add New Footer Quick Link</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={e => setNewLinkLabel(e.target.value)}
                  placeholder="Link Title (e.g. Vintage Fleeces & Vault Grails)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black border border-neutral-700 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  value={newLinkHref}
                  onChange={e => setNewLinkHref(e.target.value)}
                  placeholder="Link URL (e.g. /shop?category=Jackets)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black border border-neutral-700 text-xs text-amber-400 font-mono"
                />
                <button
                  onClick={() => {
                    if (newLinkLabel && newLinkHref) {
                      addFooterQuickLink({ label: newLinkLabel, href: newLinkHref });
                      setNewLinkLabel('');
                      setNewLinkHref('');
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase font-mono cursor-pointer shrink-0"
                >
                  Add Link
                </button>
              </div>
            </div>

            {/* List of Footer Links with Re-align Controls */}
            <div className="space-y-2 max-w-3xl">
              {currentFooterLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-amber-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white">{link.label}</span>
                      <span className="text-[10px] text-neutral-400 ml-2">({link.href})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveFooterLink(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveFooterLink(idx, 'down')}
                      disabled={idx === currentFooterLinks.length - 1}
                      className="p-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFooterQuickLink(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: COUPONS MANAGER */}
      {activeTab === 'coupons' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase">Promo Voucher & Coupon Generator</h2>
            <p className="text-xs text-neutral-400 mt-1">Create discount codes for customer checkout.</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row gap-3 max-w-xl text-xs font-mono">
            <input
              type="text"
              value={newCouponCode}
              onChange={e => setNewCouponCode(e.target.value)}
              placeholder="COUPON CODE (e.g. SUMMER20)"
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold uppercase"
              required
            />
            <input
              type="number"
              value={newCouponDiscount}
              onChange={e => setNewCouponDiscount(Number(e.target.value))}
              placeholder="Discount %"
              min={1}
              max={90}
              className="w-32 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white text-black font-bold uppercase hover:bg-neutral-200 cursor-pointer"
            >
              Create Coupon
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {coupons.map(c => (
              <div key={c.code} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">{c.code}</h4>
                  <p className="text-neutral-400 text-[11px]">{c.discountPercent}% Discount Voucher</p>
                </div>
                <button
                  onClick={() => deleteCoupon(c.code)}
                  className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: CROSS-DEVICE ORDERS LOG */}
      {/* TAB 8: CROSS-DEVICE ORDERS LOG */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-mono uppercase">
                  Live Supabase Orders Log ({orders.length})
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> REALTIME INSTANT SYNC
                </span>
              </div>
              <p className="text-neutral-400 text-xs font-mono mt-1">
                Authoritative orders fetched directly from Supabase Cloud `public.orders`
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refreshOrders()}
                disabled={isLoadingOrders}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => sendTestEmail(smtpPassSecret)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" /> Test Mailer
              </button>
            </div>
          </div>

          {/* Loading Skeleton State */}
          {isLoadingOrders && orders.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 animate-pulse space-y-3">
                  <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Banner State */}
          {ordersError && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-rose-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-200 uppercase">Orders Sync Error</p>
                  <p className="text-rose-300/80 mt-0.5">{ordersError}</p>
                </div>
              </div>
              <button
                onClick={() => refreshOrders()}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold uppercase text-[11px] shrink-0 transition-colors cursor-pointer"
              >
                Retry Orders Sync
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingOrders && !ordersError && orders.length === 0 && (
            <div className="p-16 rounded-2xl bg-neutral-950 border border-neutral-900 text-center space-y-3 font-mono">
              <Package className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white uppercase">No Orders Recorded Yet</h3>
              <p className="text-neutral-500 text-xs max-w-md mx-auto">
                Customer checkouts on www.nenoflex.in will be saved to Supabase Cloud and deliver here instantly via Realtime.
              </p>
              <button
                onClick={() => refreshOrders()}
                className="mt-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase border border-white/20 transition-all cursor-pointer"
              >
                Check For New Orders
              </button>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 font-mono text-xs hover:border-neutral-700 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700">{o.id}</span>
                      <span className="text-neutral-400 text-[11px]">
                        Placed: {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-[11px]">Status:</span>
                      <select
                        value={o.status}
                        onChange={e => updateOrderStatus(o.id, e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-black border border-neutral-700 text-xs text-emerald-400 font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Authenticated">Authenticated</option>
                        <option value="Quality Checked">Quality Checked</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* Customer Info */}
                    <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-neutral-800/50">
                      <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Customer Details</span>
                      <p className="font-bold text-white">{o.shippingAddress?.fullName || 'Customer'}</p>
                      <p className="text-neutral-400">{o.shippingAddress?.email}</p>
                      <p className="text-neutral-400">{o.shippingAddress?.phone}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-neutral-800/50">
                      <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Shipping Address</span>
                      <p className="text-neutral-300">{o.shippingAddress?.address}</p>
                      <p className="text-neutral-400">{o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}</p>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-neutral-800/50">
                      <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Payment & Total</span>
                      <p className="font-bold text-emerald-400 text-sm">₹{o.total} total</p>
                      <p className="text-neutral-400">Method: {o.paymentMethod}</p>
                      <p className="text-neutral-500 text-[10px]">
                        Subtotal: ₹{o.subtotal} | Disc: ₹{o.discount} | Ship: ₹{o.shippingFee}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-black/30 p-3 rounded-xl border border-neutral-800/50 space-y-2">
                    <span className="text-[10px] uppercase text-neutral-500 font-bold block">Purchased Items ({o.items?.length || 0})</span>
                    <div className="divide-y divide-neutral-800/60">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-neutral-300 text-[11px]">
                          <span className="font-medium text-white">{item.product?.name || 'Vault Product'} (Size: {item.selectedSize})</span>
                          <span className="text-neutral-400">Qty: {item.quantity} × ₹{item.product?.price} = ₹{(item.product?.price || 0) * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: SECURITY AUDIT TRAIL LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4 font-mono text-xs">
          <h2 className="text-xl font-bold text-white uppercase">Security & System Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-neutral-300">
              <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-900">
                    <td className="py-2.5 px-3 text-neutral-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{log.action}</td>
                    <td className="py-2.5 px-3 text-white">{log.actorEmail} ({log.actorRole})</td>
                    <td className="py-2.5 px-3 text-neutral-400">{log.targetResource}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-5 text-white overflow-y-auto max-h-[92vh] shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-lg font-mono uppercase text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create & Publish New Vault Product'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">Upload up to 10 photos. Server validation enforced.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">SKU Number</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.sku : newProd.sku}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, sku: e.target.value })
                        : setNewProd({ ...newProd, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Barcode / EAN</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.barcode : newProd.barcode}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, barcode: e.target.value })
                        : setNewProd({ ...newProd, barcode: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Product Title</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.name : (newProd.name || '')}
                  onChange={e =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProd({ ...newProd, name: e.target.value })
                  }
                  placeholder="Enter Product Name..."
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Brand Name</label>
                  <select
                    value={editingProduct ? editingProduct.brand : newProd.brand}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, brand: e.target.value as any })
                        : setNewProd({ ...newProd, brand: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white cursor-pointer font-mono"
                  >
                    {siteSettings.customBrands.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Main Category</label>
                  <select
                    value={editingProduct ? editingProduct.category : newProd.category}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, category: e.target.value as any })
                        : setNewProd({ ...newProd, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white cursor-pointer font-mono"
                  >
                    {siteSettings.customCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AVAILABLE SIZES CONTROL */}
              <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Available Product Sizes (Select Available / Active)</span>
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    Active: {((editingProduct ? editingProduct.sizes : newProd.sizes) || []).join(', ') || 'Free Size'}
                  </span>
                </div>

                {/* Standard Apparel Sizes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Standard Apparel Sizes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Oversized', 'Free Size'].map((sz) => {
                      const activeSizes = (editingProduct ? editingProduct.sizes : newProd.sizes) || [];
                      const isAvailable = activeSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const current = [...activeSizes];
                            const updated = isAvailable ? current.filter(s => s !== sz) : [...current, sz];
                            const finalSizes = updated.length > 0 ? updated : ['Free Size'];
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, sizes: finalSizes });
                            } else {
                              setNewProd({ ...newProd, sizes: finalSizes });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                            isAvailable
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md scale-105'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                          }`}
                        >
                          {isAvailable ? `✓ ${sz}` : sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pants / Waist Sizes */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Waist / Pants Sizes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['28', '30', '32', '34', '36', '38', '40'].map((sz) => {
                      const activeSizes = (editingProduct ? editingProduct.sizes : newProd.sizes) || [];
                      const isAvailable = activeSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const current = [...activeSizes];
                            const updated = isAvailable ? current.filter(s => s !== sz) : [...current, sz];
                            const finalSizes = updated.length > 0 ? updated : ['Free Size'];
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, sizes: finalSizes });
                            } else {
                              setNewProd({ ...newProd, sizes: finalSizes });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                            isAvailable
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md scale-105'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                          }`}
                        >
                          {isAvailable ? `✓ ${sz}` : sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shoes / Footwear Sizes */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Footwear / Sneaker Sizes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'].map((sz) => {
                      const activeSizes = (editingProduct ? editingProduct.sizes : newProd.sizes) || [];
                      const isAvailable = activeSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const current = [...activeSizes];
                            const updated = isAvailable ? current.filter(s => s !== sz) : [...current, sz];
                            const finalSizes = updated.length > 0 ? updated : ['Free Size'];
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, sizes: finalSizes });
                            } else {
                              setNewProd({ ...newProd, sizes: finalSizes });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                            isAvailable
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md scale-105'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                          }`}
                        >
                          {isAvailable ? `✓ ${sz}` : sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Price (INR)</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.price : newProd.price}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                        : setNewProd({ ...newProd, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-emerald-400 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Showroom MSRP</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.showroomPrice : newProd.showroomPrice}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, showroomPrice: Number(e.target.value) })
                        : setNewProd({ ...newProd, showroomPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-neutral-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-neutral-400 font-mono">Stock Count</label>
                    {editingProduct && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateProductStock(editingProduct.id, 0);
                            setEditingProduct({ ...editingProduct, stockCount: 0 });
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 cursor-pointer"
                        >
                          Mark Out of Stock (0)
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const targetStock = (editingProduct.stockCount || 0) > 0 ? editingProduct.stockCount : 5;
                            await updateProductStock(editingProduct.id, targetStock);
                            setEditingProduct({ ...editingProduct, stockCount: targetStock });
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 cursor-pointer"
                        >
                          Set In Stock (5)
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editingProduct ? editingProduct.stockCount : newProd.stockCount}
                      onChange={e =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })
                          : setNewProd({ ...newProd, stockCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono font-bold"
                      required
                    />
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={async () => {
                          const val = Number(editingProduct.stockCount ?? 0);
                          await updateProductStock(editingProduct.id, val >= 0 ? val : 0);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold hover:bg-amber-500 hover:text-black transition-all shrink-0 cursor-pointer"
                        title="Update Stock Count Instantly"
                      >
                        Update Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Condition Bar Controls */}
              <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-2">
                <label className="block text-neutral-300 font-mono text-[11px]">
                  Garment Condition Score: <strong className="text-emerald-400">{editingProduct ? editingProduct.conditionScore : newProd.conditionScore} / 10</strong>
                </label>
                <input
                  type="range"
                  min="8.0"
                  max="10.0"
                  step="0.1"
                  value={editingProduct ? editingProduct.conditionScore : newProd.conditionScore}
                  onChange={e => {
                    const score = Number(e.target.value);
                    let grade: ProductCondition = 'Mint (9.8-10)';
                    if (score < 9.0) grade = 'Vintage Choice (8.5-8.9)';
                    else if (score < 9.4) grade = 'Excellent (9.0-9.3)';
                    else if (score < 9.8) grade = 'Like New (9.4-9.7)';

                    if (editingProduct) {
                      setEditingProduct({ ...editingProduct, conditionScore: score, conditionGrade: grade });
                    } else {
                      setNewProd({ ...newProd, conditionScore: score, conditionGrade: grade });
                    }
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* 10-IMAGE GALLERY MULTI-FILE UPLOADER */}
              <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Multi-Image Gallery Uploader (Max 10 Images)
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Uploaded: {activeGallery.length} / 10 images
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="cursor-pointer px-5 py-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Upload className="w-4 h-4" /> Upload Product Images (Up to 10)
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => e.target.files && handleMultiDeviceImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Select up to 10 photos.
                  </span>
                </div>

                {/* 10-Image Thumbnails Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
                  {activeGallery.map((imgUrl, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700">
                      <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center font-mono text-emerald-400 font-bold">
                          PRIMARY
                        </span>
                      )}
                      {i === 1 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center font-mono text-amber-400 font-bold">
                          HOVER 2nd
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS: SAVE & PUBLISH LIVE */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase font-mono text-xs cursor-pointer shadow-xl flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Publishing...' : 'Publish Product Live to Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
