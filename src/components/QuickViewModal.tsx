'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ShoppingBag, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [is360Mode, setIs360Mode] = useState<boolean>(false);
  const [angleRotation, setAngleRotation] = useState<number>(0);

  if (!quickViewProduct) return null;

  const currentSize = selectedSize || quickViewProduct.sizes[0] || 'L';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#171717] border border-white/15 rounded-3xl overflow-hidden shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 text-white">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/20 text-neutral-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery / 360 View Left Column */}
        <div className="p-6 bg-neutral-900/90 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
            <img
              src={quickViewProduct.gallery[selectedImageIdx] || quickViewProduct.image}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={is360Mode ? { transform: `scale(1.05) rotate(${angleRotation}deg)` } : undefined}
            />

            {/* 360 Rotation Overlay Mode */}
            {is360Mode && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Interactive 360° Inspection
                </span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={angleRotation}
                  onChange={e => setAngleRotation(parseInt(e.target.value))}
                  className="w-48 accent-white"
                />
                <span className="text-[11px] text-neutral-300 font-mono">Drag slider to rotate item</span>
              </div>
            )}

            {/* 360 Toggle Button */}
            <button
              onClick={() => setIs360Mode(!is360Mode)}
              className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold hover:bg-white hover:text-black transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {is360Mode ? 'Standard View' : '360° Inspection'}
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-1">
            {quickViewProduct.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedImageIdx(i);
                  setIs360Mode(false);
                }}
                className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIdx === i ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Info Column */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* Brand & Condition Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-white">
                {quickViewProduct.brand}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {quickViewProduct.conditionScore}/10 Mint Condition
              </span>
            </div>

            {/* Product Name */}
            <h2 className="text-xl font-bold text-white mb-2">{quickViewProduct.name}</h2>

            {/* Price Callout */}
            <div className="flex items-baseline gap-3 my-3">
              <span className="text-2xl font-bold text-white font-mono">
                ₹{quickViewProduct.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500 line-through font-mono">
                Showroom MSRP ₹{quickViewProduct.showroomPrice.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                {quickViewProduct.discountPercent}% OFF
              </span>
            </div>

            {/* Thrift Specs */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs text-neutral-300 my-4">
              <div className="flex justify-between">
                <span className="text-neutral-500">Material:</span>
                <span className="font-medium text-white">{quickViewProduct.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fit Profile:</span>
                <span className="font-medium text-white">{quickViewProduct.fit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Authenticity:</span>
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> 100% Authenticated & UV Sanitized
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 my-4">
              <label className="block text-xs font-medium text-neutral-400 uppercase font-mono">
                Select Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map((sz, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      currentSize === sz
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                addToCart(quickViewProduct, currentSize);
                setQuickViewProduct(null);
              }}
              className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart — ₹{quickViewProduct.price.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
