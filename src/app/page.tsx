'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroCanvas } from '@/components/HeroCanvas';
import { HaoqiCreamHeroSection } from '@/components/HaoqiCreamHeroSection';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { BRANDS_LIST } from '@/data/products';

export default function HomePage() {
  const { products, siteSettings, isLoadingCatalog, catalogError, refreshCatalog } = useStore();

  const newDropsList = products.slice(0, 8);
  const vaultGrailsList = products.slice(0, 4);

  const boxOrder = siteSettings.collectionBoxOrder || ['bento-banner', 'jerseys', 'jackets-fleeces', 'brands'];
  const tickerText = siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||';

  // 3 Bento Poster Banners Customizer Values
  const posterTag1 = siteSettings.heroPosterTag1 || 'New Drops 🔥';
  const posterTitle1 = siteSettings.heroPosterTitle1 || 'NEW ARRIVAL';
  const posterSubtitle1 = siteSettings.heroPosterSubtitle1 || 'www.nenoflex.in';
  const posterLink1 = siteSettings.heroPosterLink1 || '/shop?category=New Arrivals';
  const posterBg1 = siteSettings.heroPosterBg1 || '';

  const posterImg2 = siteSettings.heroPosterImage2 || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80';
  const posterTitle2 = siteSettings.heroPosterTitle2 || 'Jackets / Windcheaters';
  const posterLink2 = siteSettings.heroPosterLink2 || '/shop?category=Jackets';

  const posterImg3 = siteSettings.heroPosterImage3 || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const posterTitle3 = siteSettings.heroPosterTitle3 || 'New Drops Jerseys 🔥 🚀';
  const posterLink3 = siteSettings.heroPosterLink3 || '/shop?category=Jerseys';

  const renderCollectionBox = (boxId: string) => {
    switch (boxId) {
      case 'bento-banner':
        return (
          <section key="bento-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Poster 1: New Arrivals */}
              <Link
                href={posterLink1}
                className="relative md:col-span-1 p-8 rounded-3xl border border-black flex flex-col justify-between min-h-[340px] shadow-lg group overflow-hidden transition-all duration-500"
                style={{
                  backgroundImage: posterBg1 ? `url(${posterBg1})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: posterBg1 ? '#000' : '#CCFF00',
                }}
              >
                {posterBg1 && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />}
                <div className="relative z-10">
                  <span className={`px-3.5 py-1 font-mono text-[10px] uppercase font-bold w-max rounded-full ${posterBg1 ? 'bg-amber-400 text-black' : 'bg-black text-white'}`}>
                    {posterTag1}
                  </span>
                </div>
                <div className="relative z-10 space-y-2">
                  <h2 className={`text-5xl font-extrabold tracking-tighter uppercase leading-none ${posterBg1 ? 'text-white' : 'text-black'}`}>
                    {posterTitle1}
                  </h2>
                  <p className={`font-mono text-xs font-bold ${posterBg1 ? 'text-amber-300' : 'text-black'}`}>
                    {posterSubtitle1}
                  </p>
                </div>
              </Link>

              {/* Poster 2: Jackets / Windcheaters */}
              <div className="relative md:col-span-1 h-[340px] bg-neutral-900 border border-black rounded-3xl overflow-hidden group shadow-lg">
                <img
                  src={posterImg2}
                  alt={posterTitle2}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                  <Link
                    href={posterLink2}
                    className="px-4 py-2.5 bg-black text-white font-mono text-xs font-bold uppercase w-max rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    {posterTitle2}
                  </Link>
                </div>
              </div>

              {/* Poster 3: New Drops Jerseys */}
              <div className="relative md:col-span-1 h-[340px] bg-neutral-900 border border-black rounded-3xl overflow-hidden group shadow-lg">
                <img
                  src={posterImg3}
                  alt={posterTitle3}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                  <Link
                    href={posterLink3}
                    className="px-4 py-2.5 bg-black text-white font-mono text-xs font-bold uppercase w-max rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    {posterTitle3}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case 'jerseys':
        return (
          <section key="jerseys" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-900">
            <div className="my-8 flex items-center justify-between">
              <h2 className="luxury-title text-3xl sm:text-4xl font-serif text-white flex items-center gap-2">
                New Drops 🔥
              </h2>
              <Link href="/shop" className="text-xs font-mono font-bold uppercase text-neutral-400 hover:text-white flex items-center gap-1">
                Shop All Vault <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Loading Skeleton */}
            {isLoadingCatalog && newDropsList.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="aspect-[3/4] bg-neutral-800 rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800 rounded w-1/2" />
                      <div className="h-4 bg-neutral-800 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Retry */}
            {catalogError && newDropsList.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <p className="text-neutral-400 font-mono text-sm">Unable to load catalog. Please try again.</p>
                <button onClick={() => refreshCatalog()} className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase hover:bg-neutral-200 transition-colors">
                  Retry
                </button>
              </div>
            )}

            {/* Products Grid */}
            {newDropsList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {newDropsList.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        );

      case 'jackets-fleeces':
        return (
          <section key="jackets-fleeces" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-900">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold uppercase font-mono tracking-wider text-white">
                Vintage Fleeces & Vault Grails
              </h2>
              <Link href="/shop" className="text-xs font-mono font-bold uppercase text-neutral-400 hover:text-white flex items-center gap-1">
                Shop All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {vaultGrailsList.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'brands':
        return (
          <section key="brands" className="bg-neutral-950 py-12 border-y border-neutral-900 text-white">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Handpicked Vault Brands
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {BRANDS_LIST.map((brand, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs font-bold uppercase rounded-full shadow-sm"
                  >
                    {brand.logo} {brand.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans">
      {/* SaaS-Style Matte Black Hero Section with Instagram Warehouse Stores & Pan-India Proof */}
      <HaoqiCreamHeroSection />

      {/* CONTINUOUS MOVING TICKER BANNER */}
      <div className="w-full bg-black border-y border-neutral-800 py-3 overflow-hidden font-mono text-[11px] uppercase tracking-widest text-neutral-300">
        <div className="whitespace-nowrap flex animate-marquee space-x-8">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>

      {/* DYNAMICALLY REORDERABLE HOMEPAGE COLLECTION BOXES */}
      {boxOrder.map(boxId => renderCollectionBox(boxId))}
    </div>
  );
}
