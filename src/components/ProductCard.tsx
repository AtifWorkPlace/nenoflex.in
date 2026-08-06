'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, CheckCircle } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSoldOut = product.stockCount <= 0;
  const hoverImg = product.imageHover || (product.gallery && product.gallery[1]) || product.image;

  return (
    <div
      className="group relative bg-white border border-neutral-200 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {/* Product Image Container with Hover 2nd Image Crossfade */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden cursor-pointer">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {/* Primary Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
              isHovered && hoverImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />

          {/* Hover 2nd Image Preview */}
          {hoverImg && (
            <img
              src={hoverImg}
              alt={`${product.name} Preview`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              loading="lazy"
            />
          )}
        </Link>

        {/* SOLD OUT Crisp Rectangular Black Badge */}
        {isSoldOut && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-black text-white text-[10px] font-mono uppercase font-bold tracking-widest">
            SOLD OUT
          </div>
        )}

        {/* Condition Score Pill */}
        {!isSoldOut && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-black border border-neutral-200 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{product.conditionScore || 9.7} / 10</span>
          </div>
        )}

        {/* Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="p-2.5 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all shadow-md"
            title="Quick Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 tracking-wider">
            {product.brand}
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            {product.discountPercent}% OFF
          </span>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-xs font-semibold text-neutral-900 line-clamp-2 hover:text-neutral-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Visual Cloth Condition Bar */}
        <div className="pt-1">
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((product.conditionScore || 9.5) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="pt-1 flex items-baseline justify-between border-t border-neutral-100">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono text-black">
              Rs. {product.price.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 line-through font-mono">
              Rs. {product.showroomPrice.toLocaleString()}
            </span>
          </div>

          {/* Solid Nike Style Add Button */}
          {!isSoldOut && (
            <button
              onClick={() => addToCart(product, product.sizes[0] || 'L')}
              className="px-3.5 py-1.5 rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center gap-1 shadow-sm"
            >
              <ShoppingBag className="w-3 h-3" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
