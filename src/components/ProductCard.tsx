'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, CheckCircle } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
  theme?: 'light' | 'dark' | 'auto';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, theme = 'auto' }) => {
  const { addToCart, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSoldOut = product.stockCount <= 0;
  const hoverImg = product.imageHover || (product.gallery && product.gallery[1]) || product.image;

  return (
    <div
      className="group relative bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/30 hover:shadow-2xl font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {/* Product Dynamic Image Frame - Border adjusts dynamically to image content size */}
      <div className="relative w-full aspect-square bg-[#1A1A1A] p-2.5 sm:p-3 overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300">
        
        {/* Dynamic Inner Bounding Box Frame */}
        <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all duration-300">
          <Link href={`/product/${product.id}`} className="block w-full h-full relative flex items-center justify-center">
            {/* Primary Product Image */}
            <img
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              decoding="async"
              className={`w-full h-full object-contain p-1 transition-all duration-300 ease-out ${
                isHovered && hoverImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
              loading="lazy"
            />

            {/* Hover 2nd Image Preview */}
            {hoverImg && (
              <img
                src={hoverImg}
                alt={`${product.name} Preview`}
                width={400}
                height={400}
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain p-1 transition-all duration-300 ease-out ${
                  isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                }`}
                loading="lazy"
              />
            )}
          </Link>
        </div>

        {/* SOLD OUT Crisp Micro Badge */}
        {isSoldOut && (
          <div className="absolute top-4 left-4 z-10 px-2.5 py-0.5 bg-black/90 text-white text-[9px] font-mono uppercase font-bold tracking-widest border border-white/20 rounded">
            SOLD OUT
          </div>
        )}

        {/* Condition Score Micro Badge */}
        {!isSoldOut && (
          <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#FAF8F5] border border-white/15 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-2.5 h-2.5 text-[#10B981]" />
            <span>{product.conditionScore || 9.7} / 10</span>
          </div>
        )}

        {/* Quick Action Preview Overlay */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="p-2 rounded-full bg-[#171717] text-[#FAF8F5] border border-white/20 hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-all shadow-md cursor-pointer"
            title="Quick Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 space-y-1.5 bg-[#121212]">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold text-[#A3A3A3] tracking-widest">
            {product.brand}
          </span>
          <span className="text-[9px] font-mono font-extrabold text-black bg-[#CCFF00] px-1.5 py-0.5 rounded-full">
            {product.discountPercent}% OFF
          </span>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5] line-clamp-1 group-hover:text-[#CCFF00] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-[11px] text-neutral-400 font-normal line-clamp-1">
          {product.category}
        </p>

        {/* Price & Add to Cart Action Row */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold font-mono text-white">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-500 line-through font-mono">
              ₹{product.showroomPrice.toLocaleString()}
            </span>
          </div>

          {!isSoldOut && (
            <button
              onClick={() => addToCart(product, product.sizes[0] || 'L')}
              className="px-3 py-1 rounded-full bg-[#FAF8F5] text-black font-mono text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#CCFF00] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
