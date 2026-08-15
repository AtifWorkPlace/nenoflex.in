'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Check, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { BRANDS_LIST } from '@/data/products';
import { BrandName, MainCategory } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const { products, filters, setFilters, siteSettings, isLoadingCatalog, catalogError, refreshCatalog } = useStore();
  const [searchInput, setSearchInput] = useState('');

  // Sync category & search from URL query params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    } else if (categoryParam === null && filters.category === '') {
      setFilters(prev => ({ ...prev, category: 'All' }));
    }

    if (searchParam) {
      setSearchInput(searchParam);
      setFilters(prev => ({ ...prev, searchQuery: searchParam }));
    }
  }, [searchParams, setFilters]);

  const categories: MainCategory[] = siteSettings?.customCategories && siteSettings.customCategories.length > 0
    ? siteSettings.customCategories
    : [
        'Jerseys',
        'Jackets',
        'Sweatshirts',
        'Hoodies',
        'Windbreakers',
        'Graphic Tees',
        'Oversized T-Shirts',
        'Cargo Pants',
        'Jeans',
        'Caps',
      ];

  // Derived filtered view from Master Product Catalog (No mutation / No duplicates)
  const filteredProducts = products.filter(product => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchTags = product.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchCategory && !matchTags) return false;
    }

    // Robust Normalized Category Matching
    if (filters.category && filters.category !== 'All') {
      const pCat = (product.category || '').trim().toLowerCase();
      const fCat = filters.category.trim().toLowerCase();

      const isMatch =
        pCat === fCat ||
        (fCat === 'jerseys' || fCat === 'jersey' ? pCat.includes('jersey') : false) ||
        (fCat === 'jackets' || fCat === 'jacket' ? pCat.includes('jacket') || pCat.includes('windbreaker') || pCat.includes('windcheater') : false) ||
        (fCat === 'sweatshirts' || fCat === 'sweatshirt' ? pCat.includes('sweatshirt') : false) ||
        (fCat === 'hoodies' || fCat === 'hoodie' ? pCat.includes('hoodie') : false) ||
        (fCat.endsWith('s') && pCat === fCat.slice(0, -1)) ||
        (pCat.endsWith('s') && fCat === pCat.slice(0, -1));

      if (!isMatch) return false;
    }

    if (filters.collection && filters.collection !== 'All') {
      if (!product.collection?.includes(filters.collection as any)) return false;
    }

    if (filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) return false;
    }

    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;

    if (filters.sizes.length > 0) {
      const hasSize = product.sizes?.some(s => filters.sizes.includes(s));
      if (!hasSize) return false;
    }

    if (filters.minCondition > 0 && product.conditionScore < filters.minCondition) return false;

    if (filters.inStockOnly && product.stockCount <= 0) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price-low') return a.price - b.price;
    if (filters.sortBy === 'price-high') return b.price - a.price;
    if (filters.sortBy === 'discount') return b.discountPercent - a.discountPercent;
    if (filters.sortBy === 'condition') return b.conditionScore - a.conditionScore;
    if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    return 0;
  });

  const toggleBrand = (b: BrandName) => {
    setFilters(prev => {
      const exists = prev.brands.includes(b);
      return {
        ...prev,
        brands: exists ? prev.brands.filter(item => item !== b) : [...prev.brands, b]
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      collection: 'All',
      brands: [],
      minPrice: 0,
      maxPrice: 20000,
      sizes: [],
      fits: [],
      minCondition: 0,
      inStockOnly: false,
      sortBy: 'featured',
    });
    setSearchInput('');
  };

  // Dynamic Category Title & Description
  const getCategoryHeader = () => {
    const cat = filters.category;
    if (!cat || cat === 'All') {
      return {
        title: 'Thrift All Drops',
        subtitle: 'Handpicked Tokyo & US Vault Grails. Authenticated & 100% Sanitized.'
      };
    }
    const catLower = cat.toLowerCase();
    if (catLower.includes('jersey')) {
      return {
        title: 'Jerseys Vault',
        subtitle: 'Authentic Vintage Football, Basketball & Retro Motorsport Jerseys'
      };
    }
    if (catLower.includes('jacket') || catLower.includes('windbreaker') || catLower.includes('windcheater')) {
      return {
        title: 'Jackets & Windcheaters Vault',
        subtitle: 'Handpicked Vintage Fleeces, Outerwear & Streetwear Windbreakers'
      };
    }
    if (catLower.includes('sweatshirt')) {
      return {
        title: 'Sweatshirts Vault',
        subtitle: 'Heavyweight Imported Tokyo & US Streetwear Sweatshirts'
      };
    }
    if (catLower.includes('hoodie')) {
      return {
        title: 'Hoodies Vault',
        subtitle: 'Premium Boxy & Oversized Streetwear Vintage Hoodies'
      };
    }
    return {
      title: `${cat} Vault`,
      subtitle: `Handpicked ${cat} Vault Drops. 100% Authenticated & Dispatched Daily.`
    };
  };

  const headerInfo = getCategoryHeader();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">

      {/* ── PAGE HERO HEADER ───────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2">
              {filters.category && filters.category !== 'All' ? `Category · ${filters.category}` : 'Handpicked Vault'}
            </p>
            <h1 className="luxury-title text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-none tracking-tight">
              {headerInfo.title}
            </h1>
            <p className="mt-3 text-xs font-mono text-neutral-500 max-w-lg">
              {headerInfo.subtitle}
            </p>
          </div>
          <p className="text-[11px] font-mono text-neutral-600 shrink-0">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'grail' : 'grails'}
          </p>
        </div>
      </div>

      {/* ── CATEGORY PILLS + SORT BAR ──────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Horizontal Category Pill Tabs (Alameda-style) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {(['All', ...categories] as string[]).map(cat => {
              const isActive = (filters.category === cat) || (cat === 'All' && (!filters.category || filters.category === 'All'));
              return (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat === 'All' ? 'Shop All' : cat}
                </button>
              );
            })}
          </div>

          {/* Right: Search + Sort */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Inline Search */}
            <div className="relative hidden sm:flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                }}
                placeholder="Search..."
                className="pl-8 pr-3 py-2 w-40 focus:w-56 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-mono focus:outline-none focus:border-white/30 transition-all duration-300 placeholder:text-neutral-600"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5" />
            </div>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[11px] font-mono cursor-pointer focus:outline-none hover:border-white/20 transition-all"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="newest">Newest</option>
            </select>

            {/* Brand filter chip (if active) */}
            {filters.brands.length > 0 && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, brands: [] }))}
                className="px-3 py-2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[11px] font-mono cursor-pointer hover:bg-[#CCFF00]/20 transition-all flex items-center gap-1"
              >
                {filters.brands.length} brand{filters.brands.length > 1 ? 's' : ''} ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative flex sm:hidden items-center mt-3">
          <input
            type="text"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
            }}
            placeholder="Search grails, jerseys, jackets, brands..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30 placeholder:text-neutral-600"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3" />
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pb-20">
        <div className="flex gap-10">

          {/* ── LEFT COLUMN: BRAND FILTER (desktop only, subtle) */}
          <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-24 space-y-6 pt-2">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-600 mb-3">Brands</p>
                <div className="space-y-1">
                  {BRANDS_LIST.slice(0, 12).map((b, i) => {
                    const selected = filters.brands.includes(b.name as BrandName);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleBrand(b.name as BrandName)}
                        className={`w-full text-left px-0 py-1 text-[12px] font-mono transition-colors cursor-pointer flex items-center justify-between group ${
                          selected ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        <span>{b.name}</span>
                        {selected && <Check className="w-3 h-3 text-[#CCFF00]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-600 mb-3">Max Price</p>
                <div className="flex justify-between text-[11px] font-mono text-neutral-500 mb-2">
                  <span>₹0</span>
                  <span className="text-white">₹{filters.maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={e => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                  className="w-full accent-[#CCFF00] cursor-pointer"
                />
              </div>

              {(filters.brands.length > 0 || filters.searchQuery || filters.maxPrice < 20000) && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-mono text-neutral-500 hover:text-white underline cursor-pointer transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── RIGHT COLUMN: PRODUCT GRID */}
          <div className="flex-1 min-w-0">

            {/* Loading skeletons */}
            {isLoadingCatalog && sortedProducts.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-2xl bg-white/[0.04]" />
                    <div className="mt-3 space-y-2">
                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                      <div className="h-3 bg-white/[0.06] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoadingCatalog && catalogError && sortedProducts.length === 0 && (
              <div className="py-24 text-center space-y-4">
                <p className="text-neutral-500 text-xs font-mono">Unable to load the vault. Please try again.</p>
                <button
                  onClick={() => refreshCatalog()}
                  className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase rounded-full cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoadingCatalog && !catalogError && sortedProducts.length === 0 && (
              <div className="py-24 text-center space-y-4">
                <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto" />
                <div>
                  <p className="text-white text-sm font-bold mb-1">No grails in this vault</p>
                  <p className="text-neutral-500 text-xs font-mono">No products found for "{filters.category}".</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase rounded-full cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  Shop All Drops
                </button>
              </div>
            )}

            {/* Product Grid — Beautiful Dark Cards (same as homepage) */}
            {!isLoadingCatalog && sortedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} theme="dark" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-neutral-400">Loading Vault Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
