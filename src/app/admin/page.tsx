'use client';

import React, { useState } from 'react';
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
  RefreshCw,
  Send,
  X,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductCondition } from '@/types';
import { NotificationSoundType } from '@/lib/audio';
import { compressImageDataUrl } from '@/lib/imageOptimizer';

export default function EnterpriseAdminDashboard() {
  const {
    products,
    orders,
    coupons,
    siteSettings,
    isAdmin,
    userRole,
    auditLogs,
    adminLogout,
    updateSiteSettings,
    addCoupon,
    deleteCoupon,
    playAdminChime,
    sendTestEmail,
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
    deleteProduct,
    resetProductsToDefault,
    updateOrderStatus,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'catalog' | 'font' | 'promo' | 'sound' | 'banner' | 'coupons' | 'orders' | 'audit'>('products');

  // Site Settings Form
  const [bannerText, setBannerText] = useState(siteSettings.announcementBanner);
  const [heroTitleText, setHeroTitleText] = useState(siteSettings.heroTitle);
  const [heroSubText, setHeroSubText] = useState(siteSettings.heroSubtitle);
  const [heroCtaText, setHeroCtaText] = useState(siteSettings.heroCtaText || 'Shop now');
  const [heroTickerText, setHeroTickerText] = useState(siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||');

  // 3 Poster Banners Customizer Form
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

  // Typography & Device Font Customizer
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

  // Footer & Social Links Customizer Form
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

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  // Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] bg-white text-black flex items-center justify-center py-16 px-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border border-neutral-300 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold uppercase font-mono">Admin Access Required</h2>
          <p className="text-xs text-neutral-600">
            This page is restricted to authorized NenoFlex administrators. Please sign in to continue.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 rounded-full bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // Device Poster Image Upload Handler (<0.03s Edge Optimization)
  const handleDevicePosterUpload = (file: File, posterIndex: 1 | 2 | 3) => {
    if (!file) return;
    showToast(`Optimizing & uploading Poster ${posterIndex} from device...`);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      const compressed = await compressImageDataUrl(rawDataUrl, 800, 0.75);
      if (posterIndex === 1) setPosterBg1(compressed);
      else if (posterIndex === 2) setPosterImg2(compressed);
      else if (posterIndex === 3) setPosterImg3(compressed);
      showToast(`Poster ${posterIndex} Image uploaded from device! Click "Save All Banners" to publish live.`);
    };
    reader.readAsDataURL(file);
  };

  // Device Promo Image Upload Handler
  const handleDevicePromoUpload = (file: File) => {
    if (!file) return;
    showToast('Optimizing & uploading Promo Image from device...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      const compressed = await compressImageDataUrl(rawDataUrl, 800, 0.75);
      setPromoImage(compressed);
      showToast('Promo Image uploaded from device!');
    };
    reader.readAsDataURL(file);
  };

  // Multi-File Device Image Upload Handler for Products
  const handleMultiDeviceImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const currentGallery = editingProduct ? (editingProduct.gallery || []) : (newProd.gallery || []);
    const remainingSlots = 10 - currentGallery.length;

    if (remainingSlots <= 0) {
      showToast('Maximum 10 images limit reached for this product!');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    let uploadedCount = 0;
    const newImageUrls: string[] = [];

    showToast('Optimizing & compressing uploaded image(s)...');

    filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target?.result as string;
        const compressedDataUrl = await compressImageDataUrl(rawDataUrl, 600, 0.72);
        newImageUrls.push(compressedDataUrl);
        uploadedCount++;

        if (uploadedCount === filesToUpload.length) {
          const updatedGallery = [...currentGallery, ...newImageUrls].slice(0, 10);
          const primary: string = updatedGallery[0] || (editingProduct ? editingProduct.image : newProd.image) || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
          const hover: string = updatedGallery[1] || primary;

          if (editingProduct) {
            const updated = {
              ...editingProduct,
              image: primary,
              imageHover: hover,
              gallery: updatedGallery,
            };
            setEditingProduct(updated);
            updateProduct(updated);
          } else {
            setNewProd(prev => ({
              ...prev,
              image: primary,
              imageHover: hover,
              gallery: updatedGallery,
            }));
          }
          showToast(`Uploaded ${newImageUrls.length} image(s)! Click "Publish Product Live" to save.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    if (editingProduct) {
      const updatedGallery = editingProduct.gallery.filter((_, i) => i !== index);
      const updated = {
        ...editingProduct,
        image: updatedGallery[0] || editingProduct.image,
        imageHover: updatedGallery[1] || updatedGallery[0] || editingProduct.imageHover,
        gallery: updatedGallery,
      };
      setEditingProduct(updated);
      updateProduct(updated);
    } else {
      const updatedGallery = (newProd.gallery || []).filter((_, i) => i !== index);
      setNewProd(prev => ({
        ...prev,
        image: updatedGallery[0] || prev.image,
        imageHover: updatedGallery[1] || updatedGallery[0] || prev.imageHover,
        gallery: updatedGallery,
      }));
    }
    showToast('Image removed from gallery');
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
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
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
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
    showToast(`Homepage Pop-up ${promoEnabled ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleSaveSound = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      ...siteSettings,
      notificationSound: selectedSound,
    });
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

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
      showToast(`✓ Updated Product "${editingProduct.name}" Live!`);
    } else {
      const title = newProd.name && newProd.name.trim().length > 0 ? newProd.name.trim() : 'Custom Vintage Vault Item';
      const fullProduct: Product = {
        ...getCleanProductTemplate(),
        ...newProd,
        name: title,
        id: `nf-${Date.now()}`,
        gallery: newProd.gallery && newProd.gallery.length > 0 ? newProd.gallery : [newProd.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
      } as Product;
      addProduct(fullProduct);
      setNewProd(getCleanProductTemplate());
      setShowAddModal(false);
      showToast(`✓ Published New Product "${fullProduct.name}" Live to Website!`);
    }
  };

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
              ROLE: {userRole.toUpperCase()} (101% CONTROL)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> SUPABASE POSTGRESQL + DISK PERSISTENCE ACTIVE
            </span>
          </div>
          <h1 className="luxury-heading text-2xl sm:text-3xl font-bold text-white mt-2">
            NenoFlex Executive Command Center
          </h1>
          <p className="text-xs text-neutral-400">Upload poster images directly from device, customize footer links live in 0.03s.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct(null);
              setNewProd(getCleanProductTemplate());
              setShowAddModal(true);
            }}
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-800 overflow-x-auto">
        {[
          { id: 'products', label: `1. Products Catalog (${products.length})`, icon: Package },
          { id: 'catalog', label: '2. Catalog Categories & Brands', icon: Layers },
          { id: 'font', label: '3. Device Font Customizer', icon: Type },
          { id: 'promo', label: '4. Promo Pop-up Banner', icon: Eye },
          { id: 'sound', label: '5. Order Sound Chime', icon: Volume2 },
          { id: 'banner', label: '6. Banners, Posters & Footer Links Customizer', icon: Settings },
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
              <h2 className="text-sm font-mono uppercase font-bold text-white">Vault Products Directory (Live Website Sync)</h2>
              <p className="text-xs text-neutral-400">Click "New Product" or "Edit" on any product to upload custom photos & publish live.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetProductsToDefault}
                className="px-3.5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                title="Clear catalog"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Products
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProd(getCleanProductTemplate());
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg"
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
                          onClick={() => updateProduct({ ...p, stockCount: p.stockCount > 0 ? 0 : 2 })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4">
            <h3 className="font-bold text-sm font-mono uppercase text-white">Customize Catalog Categories</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
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
                onChange={e => setNewBrandName(e.target.value)}
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
      )}

      {/* TAB 3: TYPOGRAPHY & FONT UPLOADER */}
      {activeTab === 'font' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase">Site-Wide Typography & Font Uploader Engine</h2>
            <p className="text-xs text-neutral-400 mt-1">Upload font files (.ttf, .otf, .woff, .woff2) directly from your device or select font presets to update the whole website font live.</p>
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
                Upload custom font files (<strong className="text-white">.ttf, .otf, .woff, .woff2</strong>) from your computer, iPhone, or Android device.
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
                updateSiteSettings({
                  ...siteSettings,
                  promoModal: { ...siteSettings.promoModal, enabled: nextState }
                });
                showToast(`Promo Banner ${nextState ? 'ENABLED' : 'DISABLED'}`);
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
                  onChange={e => setPromoTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Subtitle / Offer Description</label>
                <textarea
                  value={promoSubtitle}
                  onChange={e => setPromoSubtitle(e.target.value)}
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
                    onChange={e => setPromoImage(e.target.value)}
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
                    onChange={e => setPromoBtnText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Button CTA Link</label>
                  <input
                    type="text"
                    value={promoBtnLink}
                    onChange={e => setPromoBtnLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer"
              >
                Save Promo Pop-up Settings
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
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase">Order Push Notification Sound Chime Engine</h2>
            <p className="text-xs text-neutral-400 mt-1">Synthesized Web Audio API chimes triggered live whenever a customer completes an order.</p>
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
            className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer"
          >
            Save Sound Chime Preference
          </button>
        </div>
      )}

      {/* TAB 6: HOMEPAGE POSTERS, BANNERS & FOOTER QUICK LINKS CUSTOMIZER */}
      {activeTab === 'banner' && (
        <div className="space-y-8 font-sans">
          {/* Section 1: Homepage Hero 3 Bento Poster Banners (Device File Upload Enabled) */}
          <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Homepage Hero 3 Poster Banners & New Arrivals Image Customizer
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload images directly from your phone/PC gallery (<strong className="text-white">0.03s instant refresh</strong>) for Poster 1 (New Arrivals), Poster 2 (Jackets / Windcheaters), and Poster 3 (New Drops Jerseys 🔥 🚀).
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
                      onChange={e => setPosterTag1(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Title Text</label>
                    <input
                      type="text"
                      value={posterTitle1}
                      onChange={e => setPosterTitle1(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Subtitle Text</label>
                    <input
                      type="text"
                      value={posterSub1}
                      onChange={e => setPosterSub1(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-mono"
                    />
                  </div>

                  {/* Device Image Uploader for Poster 1 */}
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Background Image (Upload From Device)</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 1 Photo from Device 📁
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
                        onChange={e => setPosterBg1(e.target.value)}
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
                      onChange={e => setPosterLink1(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-emerald-400 font-mono"
                    />
                  </div>
                </div>

                {/* Poster Box 2: Jackets / Windcheaters */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h3 className="font-bold text-sm text-white font-mono uppercase">Poster 2: Jackets / Windcheaters</h3>

                  {/* Device Image Uploader for Poster 2 */}
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Poster Photo (Upload From Device)</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 2 Photo from Device 📁
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
                        onChange={e => setPosterImg2(e.target.value)}
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
                      onChange={e => setPosterTitle2(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Link Redirect URL</label>
                    <input
                      type="text"
                      value={posterLink2}
                      onChange={e => setPosterLink2(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Poster Box 3: New Drops Jerseys 🔥 🚀 */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h3 className="font-bold text-sm text-white font-mono uppercase">Poster 3: New Drops Jerseys</h3>

                  {/* Device Image Uploader for Poster 3 */}
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Poster Photo (Upload From Device)</label>
                    <div className="space-y-2">
                      <label className="cursor-pointer w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-200">
                        <Upload className="w-4 h-4" /> Upload Poster 3 Photo from Device 📁
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
                        onChange={e => setPosterImg3(e.target.value)}
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
                      onChange={e => setPosterTitle3(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-neutral-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Link Redirect URL</label>
                    <input
                      type="text"
                      value={posterLink3}
                      onChange={e => setPosterLink3(e.target.value)}
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
                  onChange={e => setHeroTickerText(e.target.value)}
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
                    onChange={e => setFooterPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">WhatsApp Redirect Link URL</label>
                  <input
                    type="text"
                    value={footerWhatsappUrl}
                    onChange={e => setFooterWhatsappUrl(e.target.value)}
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
                    onChange={e => setFooterInstagram(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Instagram Redirect Link URL</label>
                  <input
                    type="text"
                    value={footerInstagramUrl}
                    onChange={e => setFooterInstagramUrl(e.target.value)}
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
                  onChange={e => setFooterCopyright(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 cursor-pointer shadow-lg"
              >
                Save All Banners, Posters & Social Redirects Live Globally (0.03s Edge Refresh)
              </button>
            </form>
          </div>

          {/* Section 2: Footer Quick Links List Re-align & Customizer */}
          <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono uppercase text-emerald-400 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" /> Footer Quick Links Manager (Add, Delete & Re-align Links)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Customize the Footer Quick Links ("New Arrivals", "New Drops 🔥", "Vintage Fleeces & Vault Grails"). Move links up or down to re-align!
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
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-mono uppercase">
              Cross-Device Cloud Orders Log ({orders.length})
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                PHONE & PC LIVE SYNC: flexnagaon@gmail.com
              </span>
              <button
                onClick={() => sendTestEmail(smtpPassSecret)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" /> Test Mailer
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="font-bold text-white text-sm">{o.id}</span>
                  <p className="text-neutral-400">{o.shippingAddress.fullName} • {o.shippingAddress.email} ({o.shippingAddress.phone})</p>
                  <p className="text-emerald-400">₹{o.total} via {o.paymentMethod}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-mono">Status:</span>
                  <select
                    value={o.status}
                    onChange={e => updateOrderStatus(o.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-full bg-black border border-neutral-700 text-xs text-white cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Authenticated">Authenticated</option>
                    <option value="Quality Checked">Quality Checked</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
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

      {/* CREATE / EDIT PRODUCT MODAL WITH INSTANT PUBLISH */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-5 text-white overflow-y-auto max-h-[92vh] shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-lg font-mono uppercase text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create & Publish New Vault Product'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Upload up to 10 photos. Click "Publish Product Live to Website" to save.</p>
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
                <label className="block text-neutral-400 mb-1 font-mono">Product Title (e.g. Nike Vintage 90s Embroidered Sweatshirt)</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white cursor-pointer"
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
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white cursor-pointer"
                  >
                    {siteSettings.customCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                  <label className="block text-neutral-400 mb-1 font-mono">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.stockCount : newProd.stockCount}
                    onChange={e =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })
                        : setNewProd({ ...newProd, stockCount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-amber-400 font-mono font-bold"
                    required
                  />
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
                    Select 1 to 10 photos from PC/Phone gallery.
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
                  className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase font-mono text-xs cursor-pointer shadow-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Publish Product Live to Website & Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
