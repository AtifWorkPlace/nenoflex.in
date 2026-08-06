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

  const tickerText = siteSettings.heroTickerText || 'NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND || NO COD || REFUND ON DEMAND ||';

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
          <section key="jerseys" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-900">
            <div className="my-8">
              <h2 className="luxury-title text-3xl sm:text-4xl font-serif text-white flex items-center gap-2">
                New Drops 🔥
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {jerseys.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'jackets-fleeces':
        return (
          <section key="jackets-fleeces" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-neutral-900">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold uppercase font-mono tracking-wider text-white">
                Vintage Fleeces & Puffer Vests
              </h2>
              <Link href="/shop" className="text-xs font-mono font-bold uppercase text-neutral-400 hover:text-white flex items-center gap-1">
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
      {/* SCREENSHOT 2 ALIGNED HERO SHOWCASE SECTION */}
      <section className="relative min-h-[85vh] bg-black text-white flex flex-col items-center justify-between px-4 text-center overflow-hidden py-12">
        <HeroCanvas />

        <div className="z-10 my-auto flex flex-col items-center justify-center space-y-6 max-w-4xl">
          <h1 className="luxury-title text-8xl sm:text-[13rem] md:text-[16rem] font-bold text-white tracking-tighter leading-none select-none">
            flex
          </h1>

          <div className="pt-4">
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-transparent text-white font-mono text-xs uppercase tracking-wider border border-white/20 hover:bg-white hover:text-black transition-all hover:scale-105"
              suppressHydrationWarning
            >
              {siteSettings.heroCtaText || 'Shop now'}
            </Link>
          </div>
        </div>
      </section>

      {/* CONTINUOUS MOVING TICKER BANNER (SCREENSHOT 2 ALIGNED) */}
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
