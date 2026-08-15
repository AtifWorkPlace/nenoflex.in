'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Check, Filter } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { BRANDS_LIST } from '@/data/products';
import { BrandName, MainCategory } from '@/types';

export default function ShopPage() {
  const { products, filters, setFilters, isLoadingCatalog, catalogError, refreshCatalog } = useStore();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const categories: MainCategory[] = [
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

  const sizesList = ['S', 'M', 'L', 'XL', 'XXL', 'Oversized'];

  // Apply filters to product catalog
  const filteredProducts = products.filter(product => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchTags = product.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchCategory && !matchTags) return false;
    }

    if (filters.category && filters.category !== 'All') {
      const pCat = product.category ? product.category.trim().toLowerCase() : '';
      const fCat = filters.category.trim().toLowerCase();
      if (fCat === 'jerseys' || fCat === 'jersey') {
        if (!pCat.includes('jersey')) return false;
      } else if (pCat !== fCat) {
        return false;
      }
    }

    if (filters.collection && filters.collection !== 'All') {
      if (!product.collection.includes(filters.collection as any)) return false;
    }

    if (filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) return false;
    }

    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;

    if (filters.sizes.length > 0) {
      const hasSize = product.sizes.some(s => filters.sizes.includes(s));
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

  const toggleSize = (sz: string) => {
    setFilters(prev => {
      const exists = prev.sizes.includes(sz);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(item => item !== sz) : [...prev.sizes, sz]
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
      maxPrice: 10000,
      sizes: [],
      fits: [],
      minCondition: 0,
      inStockOnly: false,
      sortBy: 'featured',
    });
  };

  return (
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest">Handpicked Vault</span>
          <h1 className="luxury-title text-4xl font-bold text-black mt-1">
            Thrift All Drops
          </h1>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          Showing {sortedProducts.length} grails
        </div>
      </div>

      {/* Classic Nike Search Bar */}
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
          <div className="p-6 rounded-none bg-neutral-50 border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-bold text-xs uppercase font-mono text-black flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-neutral-500 hover:text-black underline font-mono"
              >
                Reset All
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-neutral-300 text-xs text-black bg-white"
              >
                <option value="All">All Categories</option>
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
                      className={`w-full px-2.5 py-1.5 rounded text-xs font-mono text-left flex items-center justify-between transition-all ${
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
                <span className="text-black font-bold">Rs. {filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={filters.maxPrice}
                onChange={e => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-black"
              />
            </div>
          </div>
        </aside>

        {/* Product Catalog Display Area */}
        <div className="flex-1 space-y-6">
          {/* Sort dropdown */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-neutral-500">Filter Applied: <strong className="text-black">{filters.category}</strong></span>
            <div className="flex items-center gap-2">
              <span>Sort:</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-1.5 rounded border border-neutral-300 bg-white text-black"
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
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-neutral-100 border border-neutral-200">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogError && sortedProducts.length === 0 ? (
            <div className="p-16 bg-neutral-50 border border-neutral-200 text-center space-y-3">
              <p className="text-neutral-500 text-xs font-mono">Unable to load catalog. Please try again.</p>
              <button
                onClick={() => refreshCatalog()}
                className="px-6 py-2 bg-black text-white font-bold text-xs uppercase"
              >
                Retry
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-16 bg-neutral-50 border border-neutral-200 text-center space-y-3">
              <p className="text-neutral-500 text-xs font-mono">No vault items match your exact filters.</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-black text-white font-bold text-xs uppercase"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
