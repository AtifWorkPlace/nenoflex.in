'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, CheckCircle } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
  theme?: 'light' | 'dark' | 'auto';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, theme = 'auto' }) => {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSoldOut = product.stockCount <= 0;
  const isWishlisted = wishlist ? wishlist.includes(product.id) : false;
  const hoverImg = product.imageHover || (product.gallery && product.gallery[1]) || product.image;

  // Subtitle matching Nike hierarchy (e.g. "Nike • Men's Vintage Jersey" or category description)
  const subtitle = product.category
    ? product.brand
      ? `${product.brand} • ${product.category}`
      : product.category
    : 'Streetwear & Vault Vintage';

  const isDark = theme === 'dark' || theme === 'auto';

  return (
    <div
      className="group relative flex flex-col font-sans transition-all duration-300 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {/* 1. BORDERLESS MINIMAL PRODUCT IMAGE CANVAS */}
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-[#151515] group-hover:bg-[#181818]' : 'bg-[#F2F2F2] group-hover:bg-[#EBEBEB]'
        }`}
      >
        <Link
          href={`/product/${product.id}`}
          className="block w-full h-full relative flex items-center justify-center p-3 sm:p-4"
        >
          {/* Primary Product Image */}
          <img
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            decoding="async"
            className={`w-full h-full object-contain transition-all duration-500 ease-out ${
              isHovered && hoverImg && hoverImg !== product.image
                ? 'opacity-0 scale-105'
                : 'opacity-100 scale-100 group-hover:scale-105'
            }`}
            loading="lazy"
          />

          {/* Hover Secondary Image Preview */}
          {hoverImg && hoverImg !== product.image && (
            <img
              src={hoverImg}
              alt={`${product.name} Preview`}
              width={400}
              height={400}
              decoding="async"
              className={`absolute inset-0 w-full h-full object-contain p-3 sm:p-4 transition-all duration-500 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              loading="lazy"
            />
          )}
        </Link>

        {/* Floating Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
            isWishlisted
              ? 'bg-white text-red-500 scale-105'
              : 'bg-white/90 text-neutral-800 hover:bg-white hover:scale-110 active:scale-95'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-800'
            }`}
          />
        </button>

        {/* SOLD OUT / CONDITION MICRO BADGE */}
        {isSoldOut ? (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 px-2 py-0.5 rounded bg-black/85 text-white text-[9px] font-mono uppercase font-bold tracking-wider">
            SOLD OUT
          </div>
        ) : (
          product.conditionScore && (
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#FAF8F5] text-[9px] font-mono font-bold flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <CheckCircle className="w-2.5 h-2.5 text-[#10B981]" />
              <span>{product.conditionScore}/10</span>
            </div>
          )
        )}

        {/* Quick Actions (Add to Bag / Quick View) Floating on Hover */}
        {!isSoldOut && (
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="w-8 h-8 rounded-full bg-black/80 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center justify-center shadow-lg cursor-pointer"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, product.sizes[0] || 'L');
              }}
              className="px-3 py-1.5 rounded-full bg-[#CCFF00] text-black font-mono text-[10px] font-extrabold uppercase tracking-wider hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shadow-lg cursor-pointer"
              title="Quick Add to Bag"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. MINIMAL NIKE-STYLE PRODUCT DETAILS (Directly Below Image) */}
      <div className="pt-2.5 pb-1 space-y-0.5">
        {/* Product Name / Title */}
        <Link href={`/product/${product.id}`} className="block">
          <h3
            className={`text-sm sm:text-[15px] font-bold tracking-tight leading-snug line-clamp-1 transition-colors ${
              isDark ? 'text-[#FAF8F5] group-hover:text-[#CCFF00]' : 'text-neutral-900 group-hover:text-neutral-600'
            }`}
          >
            {product.name}
          </h3>
        </Link>

        {/* Category Subtitle */}
        <p className={`text-xs sm:text-[13px] font-normal line-clamp-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {subtitle}
        </p>

        {/* Price & Discount Row (Exact Nike Layout: ₹Current ₹Showroom [x% off]) */}
        <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-sm sm:text-base font-bold font-mono ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            ₹{product.price.toLocaleString()}
          </span>

          {product.showroomPrice > product.price && (
            <span className="text-xs sm:text-[13px] text-neutral-500 line-through font-mono">
              ₹{product.showroomPrice.toLocaleString()}
            </span>
          )}

          {product.discountPercent > 0 && (
            <span className="text-xs sm:text-[13px] font-semibold text-emerald-400 font-sans">
              {product.discountPercent}% off
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
