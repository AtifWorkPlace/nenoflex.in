'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Check, Filter, ShoppingBag } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Category Specific Header */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest">
            {filters.category && filters.category !== 'All' ? `Category • ${filters.category}` : 'Handpicked Vault'}
          </span>
          <h1 className="luxury-title text-3xl sm:text-4xl font-bold text-black mt-1">
            {headerInfo.title}
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            {headerInfo.subtitle}
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'grail' : 'grails'}
        </div>
      </div>

      {/* Nike-Style Search Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value);
            setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
          }}
          placeholder="Search grails, jerseys, jackets, brands..."
          className="w-full pl-11 pr-4 py-3.5 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs focus:outline-none focus:border-black font-mono"
        />
        <Search className="w-4 h-4 text-neutral-500 absolute left-4" />
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-bold text-xs uppercase font-mono text-black flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-neutral-500 hover:text-black underline font-mono cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600 mb-2">
                Category
              </label>
              <select
                value={filters.category || 'All'}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-black bg-white cursor-pointer font-mono"
              >
                <option value="All">All Categories (Shop All)</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Brand Multi-Select */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600 mb-2">
                Brands ({filters.brands.length})
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {BRANDS_LIST.map((b, i) => {
                  const selected = filters.brands.includes(b.name as BrandName);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleBrand(b.name as BrandName)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all cursor-pointer ${
                        selected
                          ? 'bg-black text-white font-bold'
                          : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                    >
                      <span>{b.name}</span>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-neutral-600 mb-1">
                <span>Max Price</span>
                <span className="text-black font-bold">₹{filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="200"
                max="20000"
                step="100"
                value={filters.maxPrice}
                onChange={e => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Product Catalog Display Area */}
        <div className="flex-1 space-y-6">
          {/* Top Sort and Active Filter Display */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-neutral-500">
              Filter: <strong className="text-black font-bold">{filters.category || 'All'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span>Sort:</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-black font-mono cursor-pointer"
              >
                <option value="featured">Featured Drops</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Vault Items</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoadingCatalog && sortedProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-neutral-100 border border-neutral-200">
                  <div className="aspect-square bg-neutral-200 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogError && sortedProducts.length === 0 ? (
            <div className="p-16 bg-neutral-50 border border-neutral-200 text-center space-y-3 rounded-2xl">
              <p className="text-neutral-500 text-xs font-mono">Unable to load catalog. Please try again.</p>
              <button
                onClick={() => refreshCatalog()}
                className="px-6 py-2 bg-black text-white font-bold text-xs uppercase rounded-full cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-16 bg-neutral-50 border border-neutral-200 text-center space-y-3 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-neutral-500 text-xs font-mono">
                No products found in category "{filters.category}".
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-black text-white font-bold text-xs uppercase rounded-full cursor-pointer hover:bg-neutral-800"
              >
                View All Products (Shop All)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} theme="light" />
              ))}
            </div>
          )}
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
