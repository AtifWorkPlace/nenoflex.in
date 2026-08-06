'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { COLLECTIONS_LIST } from '@/data/products';

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-mono tracking-widest text-emerald-400 uppercase">
          Curated Vault Showrooms
        </span>
        <h1 className="luxury-heading text-4xl sm:text-6xl font-bold text-white">
          Handpicked Collections
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          From 90s archive grails to modern minimal techwear, explore our hand-curated collections imported from Tokyo, Seoul, London, and New York thrift vaults.
        </p>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COLLECTIONS_LIST.map((col, idx) => (
          <Link
            key={idx}
            href={`/shop?collection=${encodeURIComponent(col.name)}`}
            className="group relative h-96 rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl"
          >
            <img
              src={col.image}
              alt={col.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-8 flex flex-col justify-end">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest mb-1">
                {col.tag}
              </span>
              <h2 className="text-2xl font-bold text-white group-hover:underline">
                {col.name}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                <span>Explore Vault Drops</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
