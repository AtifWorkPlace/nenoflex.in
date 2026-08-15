'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Truck,
  ShieldCheck,
  Ruler,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';

export default function NikeStyledProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { products, addToCart, toggleWishlist, wishlist, showToast } = useStore();

  const product = products.find(p => p.id === productId) || products[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 'L');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Collapsible Accordion Toggles
  const [showDescription, setShowDescription] = useState(true);
  const [showConditionDetails, setShowConditionDetails] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-sans">
        <p className="font-mono text-sm">Loading Vault Grail...</p>
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.imageHover || product.image];

  const isWishlisted = wishlist.includes(product.id);

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      setPincodeStatus('Please enter a valid 6-digit pincode');
      return;
    }
    setPincodeStatus(`⚡ Express Air Shipping Available to ${pincode}! Delivery in 2-3 business days.`);
  };

  // Outer PDP Recommendation Carousel items
  const bestSellers = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Top Banner Announcement Ticker */}
      <div className="bg-[#F5F5F5] text-center py-2.5 text-xs font-mono text-neutral-800 border-b border-neutral-200">
        <span>Enjoy 15% Off On The NenoFlex Vault. Use: <strong className="font-extrabold text-black underline">FLEX15</strong></span>
        <Link href="/shop" className="ml-3 font-bold underline hover:text-neutral-600 cursor-pointer">Shop Now</Link>
      </div>

      {/* Main PDP Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 font-mono text-xs text-neutral-500 mb-6 uppercase tracking-wider overflow-x-auto">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-neutral-400">{product.brand}</span>
          <span>/</span>
          <span className="text-black font-bold line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT 7 COLUMNS: GALLERY STACK + HERO DISPLAY (55% SPLIT) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            
            {/* Vertical Square Thumbnail Column */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[600px] shrink-0 scrollbar-none pb-2 md:pb-0">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all bg-[#F8F8F8] shrink-0 cursor-pointer p-1 flex items-center justify-center ${
                    activeImageIdx === i ? 'border-black opacity-100 shadow-md' : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Center Dominant Hero Image Display */}
            <div className="order-1 md:order-2 flex-1 relative aspect-square bg-[#F6F6F6] rounded-3xl border border-neutral-200 overflow-hidden group p-4 flex items-center justify-center">
              <img
                src={gallery[activeImageIdx] || product.image}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                loading="eager"
                className="w-full h-full object-contain transition-all duration-300"
              />

              {/* Floating Carousel Navigation Arrows */}
              {gallery.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handlePrevImage}
                    className="w-9 h-9 rounded-full bg-white/95 text-black border border-neutral-300 shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="w-9 h-9 rounded-full bg-white/95 text-black border border-neutral-300 shadow-lg flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: BUY BOX & PRODUCT INFORMATION (45% SPLIT) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tag / Brand & Product Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#CCFF00]" /> Authenticated Vault Grail
                </span>
              </div>

              <div className="pt-2">
                <span className="text-xs font-mono uppercase font-bold text-neutral-500 tracking-widest block">
                  {product.brand}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-0.5 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-neutral-500 font-normal mt-1">
                  {product.category}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1 border-b border-neutral-200 pb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-black font-mono">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-neutral-400 line-through font-mono">
                  ₹{product.showroomPrice.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {product.discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">Inclusive of all taxes & free shipping across India</p>
            </div>

            {/* Variant Preview Thumbnails */}
            {gallery.length > 1 && (
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Select Color / Angle
                </label>
                <div className="flex gap-2">
                  {gallery.slice(0, 4).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-12 h-12 rounded-xl border-2 overflow-hidden transition-all bg-[#F8F8F8] cursor-pointer p-0.5 flex items-center justify-center ${
                        activeImageIdx === i ? 'border-black' : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Variant" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector Grid */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                  Select Size
                </label>
                <button
                  onClick={() => showToast('Size Guide: Standard International Fit')}
                  className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 font-mono cursor-pointer transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border font-mono font-bold text-xs transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action CTAs: Prominent Add to Bag & Secondary Favourite */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => addToCart(product, selectedSize)}
                className="w-full py-4 rounded-full bg-black text-white font-mono font-extrabold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#CCFF00]" /> Add to Bag
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-full py-3.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-black border-neutral-300 hover:border-black'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                {isWishlisted ? 'Saved to Favourites' : 'Favourite ♡'}
              </button>
            </div>

            {/* Pincode Delivery Checker */}
            <div className="p-4 rounded-2xl bg-[#F8F8F8] border border-neutral-200 space-y-2">
              <label className="block text-xs font-mono font-bold text-black uppercase tracking-wider">
                Check Delivery Date
              </label>
              <p className="text-[11px] text-neutral-500">Enter pincode to verify express delivery dates across India</p>
              <form onSubmit={handleCheckPincode} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="6-Digit Pincode"
                  maxLength={6}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-mono font-bold uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-[11px] text-emerald-600 font-bold pt-1 font-mono">{pincodeStatus}</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 pt-1 text-xs text-neutral-700 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-black" />
                  14-Day Refund & Size Exchange
                </span>
                <span className="underline font-bold cursor-pointer hover:text-black">Know More</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Free Express Shipping Pan-India
                </span>
                <span className="underline font-bold cursor-pointer hover:text-black">Know More</span>
              </div>
            </div>

            {/* Information Accordions */}
            <div className="border-t border-neutral-200 pt-3 space-y-3 font-sans text-xs">
              
              {/* Description & Specs Accordion */}
              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center justify-between font-mono text-xs font-bold text-black uppercase py-1 cursor-pointer"
                >
                  <span>Description & Specs</span>
                  {showDescription ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {showDescription && (
                  <div className="text-neutral-700 pt-2 text-xs space-y-2 leading-relaxed">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-neutral-600">
                      <li>Material: {product.material}</li>
                      <li>Fit Profile: {product.fit}</li>
                      <li>Category: {product.category}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Authenticity & Condition Accordion */}
              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowConditionDetails(!showConditionDetails)}
                  className="w-full flex items-center justify-between font-mono text-xs font-bold text-black uppercase py-1 cursor-pointer"
                >
                  <span>Authenticity & Condition</span>
                  {showConditionDetails ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {showConditionDetails && (
                  <div className="text-neutral-700 pt-2 text-xs space-y-2 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Condition Score: {product.conditionScore}/10 ({product.conditionGrade})
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-normal">
                      100% Authenticated & 7-Step Ozone Sanitized imported thrift grail. Every item passes strict verification before entering the NenoFlex vault.
                    </p>
                  </div>
                )}
              </div>

              {/* Return Policy Accordion */}
              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowReturnPolicy(!showReturnPolicy)}
                  className="w-full flex items-center justify-between font-mono text-xs font-bold text-black uppercase py-1 cursor-pointer"
                >
                  <span>Return & Exchange Policy</span>
                  {showReturnPolicy ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {showReturnPolicy && (
                  <p className="text-neutral-600 pt-2 text-[11px] leading-relaxed">
                    Hassle-free 14-day return and size exchange. If the fit doesn't match your style, return or swap for store credit instantly.
                  </p>
                )}
              </div>

              {/* Vendor Details Accordion */}
              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowVendorDetails(!showVendorDetails)}
                  className="w-full flex items-center justify-between font-mono text-xs font-bold text-black uppercase py-1 cursor-pointer"
                >
                  <span>Vendor & Dispatch Details</span>
                  {showVendorDetails ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {showVendorDetails && (
                  <p className="text-neutral-600 pt-2 text-[11px] leading-relaxed">
                    NenoFlex Official Vault, Guwahati AS. Handpicked imported Tokyo & Seoul vintage thrift grails. Dispatched daily across Pan-India.
                  </p>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM PURCHASE BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <h4 className="text-xs font-bold text-black line-clamp-1">{product.name}</h4>
          <span className="text-sm font-bold font-mono text-black">₹{product.price.toLocaleString()}</span>
        </div>
        <button
          onClick={() => addToCart(product, selectedSize)}
          className="px-5 py-2.5 rounded-full bg-black text-white font-mono font-extrabold text-xs uppercase tracking-wider shadow-lg shrink-0 cursor-pointer hover:bg-neutral-800"
        >
          Add to Bag
        </button>
      </div>

      {/* OUTER PDP: YOU MAY ALSO LIKE / RELATED PRODUCTS */}
      <section className="bg-[#F9F9F9] border-t border-neutral-200 py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-black">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-black uppercase tracking-tight">
              You May Also Like ✨
            </h2>
            <Link href="/shop" className="text-xs font-mono font-bold uppercase tracking-wider text-black hover:underline">
              Shop All Vault →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((item) => (
              <ProductCard key={item.id} product={item} theme="light" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
