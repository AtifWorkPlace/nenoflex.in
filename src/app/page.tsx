'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroCanvas } from '@/components/HeroCanvas';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { BRANDS_LIST } from '@/data/products';

export default function HomePage() {
  const { products, siteSettings } = useStore();

  const jerseys = products.filter(p => p.category === 'Jerseys' || p.tags.includes('jersey'));
  const fleeceAndJackets = products.filter(p => p.category === 'Jackets' || p.category === 'Sweatshirts');

  const boxOrder = siteSettings.collectionBoxOrder || ['bento-banner', 'jerseys', 'jackets-fleeces', 'brands'];

  const renderCollectionBox = (boxId: string) => {
    switch (boxId) {
      case 'bento-banner':
        return (
          <section key="bento-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 bg-[#CCFF00] p-8 rounded-3xl border border-black flex flex-col justify-between min-h-[340px] shadow-lg">
                <span className="px-3.5 py-1 bg-black text-white font-mono text-[10px] uppercase font-bold w-max rounded-full">
                  New Drops 🔥
                </span>
                <div className="space-y-2">
                  <h2 className="text-5xl font-extrabold tracking-tighter text-black uppercase leading-none">
                    NEW ARRIVAL
                  </h2>
                  <p className="font-mono text-xs font-bold text-black">
                    www.nenoflex.in
                  </p>
                </div>
              </div>

              <div className="relative md:col-span-1 h-[340px] bg-neutral-900 border border-black rounded-3xl overflow-hidden group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
                  alt="Jackets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                  <Link
                    href="/shop?category=Jackets"
                    className="px-4 py-2.5 bg-black text-white font-mono text-xs font-bold uppercase w-max rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    Jackets / Windcheaters
                  </Link>
                </div>
              </div>

              <div className="relative md:col-span-1 h-[340px] bg-neutral-900 border border-black rounded-3xl overflow-hidden group shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                  alt="Jerseys"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                  <Link
                    href="/shop?category=Jerseys"
                    className="px-4 py-2.5 bg-black text-white font-mono text-xs font-bold uppercase w-max rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    New Drops Jerseys 🔥 🚀
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case 'jerseys':
        return (
          <section key="jerseys" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-200">
            <div className="text-center my-8">
              <h2 className="luxury-title text-4xl sm:text-5xl font-serif text-black">
                New Drops Jerseys 🔥 🚀
              </h2>
              <div className="flex justify-between items-center mt-6 text-xs text-neutral-500 border-b border-neutral-200 pb-3 font-mono">
                <span>Availability • Price</span>
                <span>{jerseys.length} items</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {jerseys.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'jackets-fleeces':
        return (
          <section key="jackets-fleeces" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold uppercase font-mono tracking-wider text-black">
                Vintage Fleeces & Puffer Vests
              </h2>
              <Link href="/shop" className="text-xs font-mono font-bold uppercase text-black hover:underline flex items-center gap-1">
                Shop All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {fleeceAndJackets.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'brands':
        return (
          <section key="brands" className="bg-neutral-100 py-12 border-y border-neutral-200 text-black">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Handpicked Vault Brands
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {BRANDS_LIST.map((brand, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white border border-neutral-300 text-black font-mono text-xs font-bold uppercase rounded-full shadow-sm"
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
    <div className="relative min-h-screen bg-white text-black font-sans">
      {/* HERO SHOWCASE SECTION */}
      <section className="relative min-h-[85vh] bg-black text-white flex flex-col items-center justify-between px-4 text-center overflow-hidden py-12">
        <HeroCanvas />

        <div className="z-10 mt-2">
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-widest text-neutral-200 uppercase" suppressHydrationWarning>
            {siteSettings.announcementBanner}
          </span>
        </div>

        <div className="z-10 my-auto flex flex-col items-center justify-center space-y-4 max-w-4xl">
          <h1 className="luxury-title text-7xl sm:text-9xl md:text-[12rem] font-bold text-white tracking-tighter leading-none select-none">
            flex
          </h1>
          <h2 className="text-xl sm:text-3xl font-serif text-neutral-300 tracking-tight" suppressHydrationWarning>
            {siteSettings.heroTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono" suppressHydrationWarning>
            {siteSettings.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link
              href="/shop"
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all hover:scale-105 shadow-2xl flex items-center gap-2"
              suppressHydrationWarning
            >
              {siteSettings.heroCtaText || 'Shop Now'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/collections"
              className="px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all hover:scale-105"
              suppressHydrationWarning
            >
              {siteSettings.heroSecondaryCtaText || 'Explore Vault'}
            </Link>
          </div>
        </div>

        <div className="z-10 mb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Scroll to explore vault drops
        </div>
      </section>

      {/* DYNAMICALLY REORDERABLE HOMEPAGE COLLECTION BOXES */}
      {boxOrder.map(boxId => renderCollectionBox(boxId))}
    </div>
  );
}
