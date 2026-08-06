'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Sparkles, Send, Lock, Phone, Instagram } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const Footer: React.FC = () => {
  const { siteSettings, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast('Subscribed! Use code GET10OFF at checkout 🎉');
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-neutral-800 text-neutral-400 text-sm mt-24 font-sans">
      {/* Value Proposition Badges Bar */}
      <div className="border-b border-neutral-800 py-8 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2 p-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">100% Authenticated</h4>
            <p className="text-[11px] text-neutral-500">Handpicked imported vault verification</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">7-Step Sanitization</h4>
            <p className="text-[11px] text-neutral-500">Ozone & UV deep disinfected</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">Express Air Shipping</h4>
            <p className="text-[11px] text-neutral-500">2-4 days pan-India delivery</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <RotateCcw className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">Easy Returns</h4>
            <p className="text-[11px] text-neutral-500">Hassle-free verification guarantee</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Dynamic Admin Settings */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Overview */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="luxury-title text-3xl font-bold text-white">
              Neno<span className="italic text-neutral-400">Flex</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
            {siteSettings.footerTagline}
          </p>

          <div className="space-y-2 text-xs text-neutral-300 font-mono pt-1">
            {/* Clickable WhatsApp Redirect */}
            <a
              href={siteSettings.footerWhatsappUrl || 'https://wa.me/916000149919'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp: <strong className="text-white underline">{siteSettings.footerPhone}</strong></span>
            </a>

            {/* Clickable Instagram Redirect */}
            <a
              href={siteSettings.footerInstagramUrl || 'https://instagram.com/flexnagaon'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram: <strong className="text-white underline">{siteSettings.footerInstagram}</strong></span>
            </a>
          </div>

          {/* Newsletter Box */}
          <div className="pt-4 space-y-2">
            <h5 className="text-xs font-mono uppercase font-bold text-white">Join Secret Thrift Drops</h5>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                You’re on the drop list! Code: <strong className="font-mono text-white">GET10OFF</strong>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-white font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Top Categories</h4>
          <ul className="space-y-2 text-xs">
            {['Jerseys', 'Jackets & Windcheaters', 'Sweatshirts & Fleeces', 'Graphic & Oversized Tees', 'Cargo Pants & Jeans', 'Caps & Accessories'].map((cat, i) => (
              <li key={i}>
                <Link href="/shop" className="hover:text-white transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Collections</h4>
          <ul className="space-y-2 text-xs">
            {['Vintage Collection', 'Y2K Collection', 'Streetwear Vault', 'Winter Collection', 'Imported Collection', 'Limited 1-of-1 Edition'].map((col, i) => (
              <li key={i}>
                <Link href="/collections" className="hover:text-white transition-colors">
                  {col}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            {['Track Your Order', 'Sanitization Process', 'Size & Fit Guide', 'FAQ & Support', 'Privacy & Terms'].map((link, i) => (
              <li key={i}>
                <Link href="/about" className="hover:text-white transition-colors">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Rights & Security */}
      <div className="border-t border-neutral-800 py-6 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p suppressHydrationWarning>{siteSettings.footerCopyright || '© 2022 NenoFlex Official. All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted Payment
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span>QR PRE-PAID</span>
              <span>•</span>
              <span>UPI</span>
              <span>•</span>
              <span>RAZORPAY</span>
              <span>•</span>
              <span>COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
