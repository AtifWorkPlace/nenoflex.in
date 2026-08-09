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
  Ruler
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

  // Accordion Toggles
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <p>Loading NenoFlex Vault Item...</p>
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
      <div className="bg-[#f5f5f5] text-center py-2 text-xs font-sans text-neutral-800 border-b border-neutral-200">
        <span>Enjoy 15% Off On The NenoFlex App. Use: <strong className="font-bold">FLEX15</strong></span>
        <span className="ml-3 underline cursor-pointer">Download Now</span>
      </div>

      {/* Main PDP Grid Container (Screenshots 1, 3 & 4 Aligned) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT 7 COLUMNS: GALLERY STACK + HERO DISPLAY */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            
            {/* Vertical Thumbnail Stack (Left Column) */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[600px] shrink-0 scrollbar-none">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-16 h-18 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all bg-[#f5f5f5] shrink-0 cursor-pointer ${
                    activeImageIdx === i ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Center Hero Image Display with Floating Navigation Controls */}
            <div className="order-1 md:order-2 flex-1 relative aspect-[4/5] bg-[#f5f5f5] rounded-3xl overflow-hidden group">
              <img
                src={gallery[activeImageIdx] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Floating Carousel Navigation Arrows (Screenshots 1, 3 & 4 Spec) */}
              {gallery.length > 1 && (
                <div className="absolute bottom-6 right-6 flex items-center gap-2">
                  <button
                    onClick={handlePrevImage}
                    className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: BUY BOX (NIKE SPEC) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tag / Subtitle */}
            <div>
              <span className="text-xs font-bold text-red-600 font-sans tracking-wide">
                Just In
              </span>
              <h1 className="text-3xl font-extrabold text-black tracking-tight mt-1">
                {product.name}
              </h1>
              <p className="text-sm text-neutral-500 font-normal mt-0.5">
                {product.brand} • {product.category}
              </p>
            </div>

            {/* Price Display */}
            <div className="space-y-1 border-b border-neutral-200 pb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-black font-sans">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  ₹{product.showroomPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {product.discountPercent}% OFF
                </span>
              </div>
              <p className="text-xs text-neutral-500">Inclusive of all taxes</p>
            </div>

            {/* Variant Preview Thumbnails */}
            <div className="flex gap-2">
              {gallery.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-14 h-16 rounded-xl border-2 overflow-hidden transition-all bg-[#f5f5f5] cursor-pointer ${
                    activeImageIdx === i ? 'border-black' : 'border-neutral-200'
                  }`}
                >
                  <img src={img} alt="Variant" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Size Selector Grid (2-Column Rectangular Buttons) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black uppercase tracking-wider font-sans">
                  Select Size
                </label>
                <button
                  onClick={() => showToast('Size Guide: Standard International Fit')}
                  className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3.5 rounded-xl border font-sans font-bold text-xs transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-neutral-300 text-neutral-800 hover:border-black bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action CTA Buttons (Nike Solid & Outline Pills) */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => addToCart(product, selectedSize)}
                className="w-full py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-full py-4 rounded-full border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-black border-neutral-300 hover:border-black'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                {isWishlisted ? 'Saved to Favourites' : 'Favourite ♡'}
              </button>
            </div>

            {/* Description & Specs */}
            <div className="pt-4 border-t border-neutral-200 space-y-3 text-xs text-neutral-700 leading-relaxed">
              <p>{product.description}</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-neutral-600">
                <li>Material: {product.material}</li>
                <li>Fit Profile: {product.fit}</li>
                <li>Authenticity: 100% Authenticated & 7-Step Ozone Sanitized</li>
                <li>Garment Condition: {product.conditionScore}/10 ({product.conditionGrade})</li>
              </ul>
            </div>

            {/* Pincode Delivery Checker */}
            <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-neutral-200 space-y-2">
              <label className="block text-xs font-bold text-black">Check delivery date</label>
              <p className="text-[11px] text-neutral-500">Enter pincode to know exact delivery dates/charges</p>
              <form onSubmit={handleCheckPincode} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="Pincode"
                  maxLength={6}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-black focus:outline-none focus:border-black font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold uppercase cursor-pointer"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-[11px] text-emerald-600 font-bold pt-1 font-mono">{pincodeStatus}</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="space-y-2.5 pt-2 text-xs text-neutral-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-black" />
                  14-day return and size exchange
                </span>
                <span className="underline font-bold cursor-pointer">Know More</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-black" />
                  Free delivery available
                </span>
                <span className="underline font-bold cursor-pointer">Know More</span>
              </div>
            </div>

            {/* Collapsible Accordions */}
            <div className="border-t border-neutral-200 pt-3 space-y-3 text-xs font-sans">
              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowVendorDetails(!showVendorDetails)}
                  className="w-full flex items-center justify-between font-bold text-black py-1 cursor-pointer"
                >
                  <span>Vendor Details</span>
                  {showVendorDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showVendorDetails && (
                  <p className="text-neutral-600 pt-2 text-[11px] leading-relaxed">
                    NenoFlex Official Vault, Guwahati AS. Handpicked imported Tokyo & Seoul vintage thrift grails.
                  </p>
                )}
              </div>

              <div className="border-b border-neutral-200 pb-3">
                <button
                  onClick={() => setShowReturnPolicy(!showReturnPolicy)}
                  className="w-full flex items-center justify-between font-bold text-black py-1 cursor-pointer"
                >
                  <span>Return And Exchange Policy</span>
                  {showReturnPolicy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showReturnPolicy && (
                  <p className="text-neutral-600 pt-2 text-[11px] leading-relaxed">
                    All items undergo strict 7-step ozone sanitization and authenticity verification. Returns accepted within 14 days.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* OUTER PDP: BEST SELLERS / RECOMMENDED CAROUSEL (SCREENSHOT 2 ALIGNED) */}
      <section className="bg-[#f9f9f9] border-t border-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black tracking-tight">Best Sellers</h2>
            <div className="flex items-center gap-2">
              <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-black underline">
                Shop All
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
