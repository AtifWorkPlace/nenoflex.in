'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Tag, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const PromoModal: React.FC = () => {
  const { siteSettings } = useStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const promo = siteSettings?.promoModal;

  useEffect(() => {
    if (!promo || !promo.enabled) return;
    // Check if dismissed in current session
    const dismissed = sessionStorage.getItem('nenoflex_promo_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [promo]);

  if (!isOpen || !promo || !promo.enabled) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('nenoflex_promo_dismissed', 'true');
  };

  return (
    <div className="fixed inset-0 z-50 p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-300">
      {/* Dark Matte Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      {/* Matte Black Pop-Up Box */}
      <div className="relative w-full max-w-lg bg-[#171717] border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10 text-white animate-in zoom-in-95 duration-300">
        {/* Top Right Close Cross Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 border border-white/20 text-neutral-300 hover:text-white hover:bg-black transition-all"
          title="Close announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-Resolution Banner Image */}
        {promo.image && (
          <div className="relative w-full h-48 sm:h-56 bg-neutral-900 overflow-hidden">
            <img
              src={promo.image}
              alt={promo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent" />
          </div>
        )}

        {/* Pop-Up Content Body */}
        <div className="p-6 sm:p-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
            <Tag className="w-3 h-3" /> Special Vault Event
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white luxury-heading">
            {promo.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
            {promo.subtitle}
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href={promo.buttonLink || '/shop'}
              onClick={handleClose}
              className="w-full py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105"
            >
              {promo.buttonText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
