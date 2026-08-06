'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShoppingBag,
  Heart,
  Sparkles,
  RefreshCw,
  Truck,
  CheckCircle2,
  ArrowRight,
  Star,
  Share2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { products, wishlist, toggleWishlist, addToCart, showToast } = useStore();

  const product = products.find(p => p.id === productId) || products[0];
  const isWishlisted = wishlist.includes(product.id);

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [is360Mode, setIs360Mode] = useState<boolean>(false);
  const [angleRotation, setAngleRotation] = useState<number>(0);
  const [pincode, setPincode] = useState<string>('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      showToast('Please enter a valid 6-digit PIN code');
      return;
    }
    setDeliveryEstimate('Express Air Delivery guaranteed by Friday (2-3 Business Days)');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <Link href="/shop" className="hover:text-white">Shop Vault</Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-white truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery & 360 Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 group shadow-2xl">
            <img
              src={product.gallery[selectedImageIdx] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
              style={is360Mode ? { transform: `scale(1.05) rotate(${angleRotation}deg)` } : undefined}
            />

            {/* 360 Overlay */}
            {is360Mode && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold flex items-center gap-1.5 text-white">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Interactive 360° Inspection Mode
                </span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={angleRotation}
                  onChange={e => setAngleRotation(parseInt(e.target.value))}
                  className="w-56 accent-white"
                />
                <span className="text-xs text-neutral-300 font-mono">Rotate slider to view garment angles</span>
              </div>
            )}

            {/* 360 Toggle Button */}
            <button
              onClick={() => setIs360Mode(!is360Mode)}
              className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {is360Mode ? 'Standard View' : '360° Inspection'}
            </button>

            {/* Wishlist Floating Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all ${
                isWishlisted
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-black/60 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Strip */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImageIdx(idx);
                  setIs360Mode(false);
                }}
                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIdx === idx ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Brand & Condition Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-white">
                {product.brand}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {product.conditionScore}/10 Condition Grade
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {product.rating} ({product.reviewsCount} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-white/10 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white font-mono">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500 line-through font-mono">
                Showroom MSRP ₹{product.showroomPrice.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold border border-rose-500/30">
                {product.discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-mono">
              Saved ₹{(product.showroomPrice - product.price).toLocaleString()} compared to showroom MSRP.
            </p>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-mono font-bold text-neutral-400 uppercase">
                Select Size:
              </label>
              <span className="text-rose-400 font-mono font-bold animate-pulse">
                ⚡ Only {product.stockCount} left in vault stock!
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                    selectedSize === sz
                      ? 'bg-white text-black border-white shadow-lg scale-105'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => addToCart(product, selectedSize)}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-white/20 active:scale-98"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Vault Cart — ₹{product.price.toLocaleString()}
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" /> Delivery Estimate
            </h4>
            <form onSubmit={checkPincode} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
                className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Check
              </button>
            </form>
            {deliveryEstimate && (
              <p className="text-xs text-emerald-400 font-mono">{deliveryEstimate}</p>
            )}
          </div>

          {/* Authenticity & Condition Checklist */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-white/10 space-y-3 text-xs text-neutral-300">
            <h4 className="font-bold text-white font-mono uppercase">7-Point Inspection Verification</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authentic Japan/US Thrift Import
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hospital-Grade Ozone Gas & UV Disinfected
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Stitching & Zipper Hardware Flawless
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Outfit Recommendations ("Complete the Flex") */}
      <section className="pt-12 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">AI Stylist Combo</span>
            <h2 className="luxury-heading text-2xl font-bold text-white mt-1">Complete The Flex</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map(rel => (
            <ProductCard key={rel.id} product={rel} />
          ))}
        </div>
      </section>
    </div>
  );
}
