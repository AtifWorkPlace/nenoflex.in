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
  MoveUp,
  MoveDown,
  FileText,
  Volume2,
  Eye,
  Check,
  Layers,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductCondition } from '@/types';
import { NotificationSoundType } from '@/lib/audio';

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
    reorderCollectionBoxes,
    addCoupon,
    deleteCoupon,
    playAdminChime,
    addCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'banner' | 'promo' | 'sound' | 'catalog' | 'products' | 'coupons' | 'orders' | 'audit'>('products');

  // Site Settings Form
  const [bannerText, setBannerText] = useState(siteSettings.announcementBanner);
  const [heroTitleText, setHeroTitleText] = useState(siteSettings.heroTitle);
  const [heroSubText, setHeroSubText] = useState(siteSettings.heroSubtitle);
  const [heroCtaText, setHeroCtaText] = useState(siteSettings.heroCtaText || 'Shop now');
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState(siteSettings.heroSecondaryCtaText || 'Explore Vault');
  const [heroTickerText, setHeroTickerText] = useState(siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||');

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

  const [newProd, setNewProd] = useState<Partial<Product>>({
    sku: `SKU-NF-${Math.floor(100 + Math.random() * 900)}`,
    barcode: `890123${Math.floor(1000000 + Math.random() * 9000000)}`,
    name: 'Vintage 90s Embroidered Sweatshirt',
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
    gallery: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    isNewArrival: true,
    isTrending: true,
    isBestSeller: false,
    isLimited: true,
    stockCount: 3,
    rating: 5.0,
    reviewsCount: 12,
    tags: ['nike', 'sweatshirt', 'black', 'vintage'],
  });

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

  // Device File Upload Handler
  const handleDeviceImageUpload = (file: File, target: 'primary' | 'hover') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          [target === 'primary' ? 'image' : 'imageHover']: dataUrl
        });
      } else {
        setNewProd({
          ...newProd,
          [target === 'primary' ? 'image' : 'imageHover']: dataUrl
        });
      }
      showToast(`Uploaded ${target === 'primary' ? 'Primary' : 'Hover 2nd'} image from device!`);
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
      heroSecondaryCtaText,
      heroTickerText,
      footerTagline,
      footerPhone,
      footerWhatsappUrl,
      footerInstagram,
      footerInstagramUrl,
      footerCopyright,
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
    showToast(`Homepage Pop-up ${promoEnabled ? 'ENABLED' : 'DISABLED'}!`);
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
    } else {
      const fullProduct: Product = {
        ...newProd,
        id: `nf-${Date.now()}`,
      } as Product;
      addProduct(fullProduct);
      setShowAddModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="p-8 rounded-3xl bg-black border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
              ROLE: {userRole.toUpperCase()} (101% CONTROL)
            </span>
          </div>
          <h1 className="luxury-heading text-3xl font-bold text-white mt-1">
            NenoFlex Executive Command Center
          </h1>
          <p className="text-xs text-neutral-400">WhatsApp & Instagram Link Redirect Control, Moving Ticker, Nodemailer Alert Engine.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button
            onClick={adminLogout}
            className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-800 overflow-x-auto">
        {[
          { id: 'products', label: `1. Products (${products.length})`, icon: Package },
          { id: 'catalog', label: '2. Catalog Categories & Brands', icon: Layers },
          { id: 'promo', label: '3. Promo Pop-up Banner', icon: Eye },
          { id: 'sound', label: '4. Order Sound Chime', icon: Volume2 },
          { id: 'banner', label: '5. Site Banner & Social Redirects', icon: Settings },
          { id: 'coupons', label: `6. Coupons (${coupons.length})`, icon: Tag },
          { id: 'orders', label: `7. Orders (${orders.length})`, icon: TrendingUp },
          { id: 'audit', label: `8. Audit Logs (${auditLogs.length})`, icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                active ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SHOPIFY-STYLE PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-black border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Condition Grade</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {products.map(p => (
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
                    <td className="py-3 px-4 font-mono">{p.stockCount}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateProduct({ ...p, stockCount: p.stockCount > 0 ? 0 : 2 })}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          p.stockCount <= 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {p.stockCount <= 0 ? 'SOLD OUT' : 'IN STOCK'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZABLE CATALOG CATEGORIES & BRANDS */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Customizer */}
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
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase"
              >
                Add Category
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-400 font-mono">
              {siteSettings.customCategories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-2.5 rounded-xl bg-neutral-900">
                  <span className="text-white font-bold">{cat}</span>
                  <button
                    onClick={() => deleteCategory(cat)}
                    className="p-1 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Customizer */}
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
                  placeholder="Logo Emoji"
                  className="w-24 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  value={newBrandOrigin}
                  onChange={e => setNewBrandOrigin(e.target.value)}
                  placeholder="Origin Country (e.g. USA)"
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono"
                />
                <button
                  onClick={() => {
                    if (newBrandName) {
                      addBrand({ name: newBrandName, logo: newBrandLogo, origin: newBrandOrigin });
                      setNewBrandName('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase"
                >
                  Add Brand
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-400 font-mono">
              {siteSettings.customBrands.map(b => (
                <div key={b.name} className="flex justify-between items-center p-2.5 rounded-xl bg-neutral-900">
                  <span className="text-white font-bold">{b.logo} {b.name} ({b.origin})</span>
                  <button
                    onClick={() => deleteBrand(b.name)}
                    className="p-1 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SITE BANNER & SOCIAL REDIRECT LINKS CUSTOMIZER */}
      {activeTab === 'banner' && (
        <div className="p-8 rounded-3xl bg-black border border-neutral-800 space-y-6">
          <h2 className="text-xl font-bold text-white font-mono uppercase">101% Site Banner, Moving Ticker & Redirect Link Control</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block text-neutral-400 font-mono mb-1">Continuous Moving Ticker Banner Text (Screenshot 2 Spec)</label>
              <input
                type="text"
                value={heroTickerText}
                onChange={e => setHeroTickerText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-mono mb-1">Top Announcement Ticker</label>
              <input
                type="text"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
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
              className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200"
            >
              Update All Redirect Links & Copy Live
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: FULFILLMENT & ORDERS LOG WITH NODEMAILER ALERT RE-DISPATCH */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-mono uppercase">Fulfillment & Live Orders Log</h2>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              EMAIL NOTIFICATION: flexnagaon@gmail.com
            </span>
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
                    className="px-3 py-1.5 rounded-full bg-black border border-neutral-700 text-xs text-white"
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

      {/* CREATE / EDIT PRODUCT MODAL WITH DEVICE FILE PICKER */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-4 text-white overflow-y-auto max-h-[90vh] shadow-2xl font-sans">
            <h3 className="font-bold text-lg font-mono uppercase">
              {editingProduct ? `Edit SKU ${editingProduct.sku}` : 'Add New Vault Product (Shopify Spec)'}
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
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
                  value={editingProduct ? editingProduct.name : newProd.name}
                  onChange={e =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProd({ ...newProd, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-full bg-neutral-800 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black font-bold uppercase"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
