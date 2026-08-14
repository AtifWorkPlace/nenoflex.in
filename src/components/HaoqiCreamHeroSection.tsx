'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Globe, ArrowRight, Instagram, ChevronDown, Truck, PackageCheck } from 'lucide-react';

export const HaoqiCreamHeroSection: React.FC = () => {
  const [coords, setCoords] = useState({ x: 963, y: 209 });
  const [timeStr, setTimeStr] = useState('01:25');

  // Smooth 3D Mouse Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [12, -12]);
  const rotateY = useTransform(mouseX, [-400, 400], [-16, 16]);
  const textTranslateZ = useTransform(mouseX, [-400, 400], [30, 30]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);

    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      mouseX.set(e.clientX - windowWidth / 2);
      mouseY.set(e.clientY - windowHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const activeBranches = [
    {
      name: '@flexnagaon',
      label: 'Nagaon Hub',
      url: 'https://instagram.com/flexnagaon',
      badgeText: '🔥 HIGH STOCK (LIVE SUPPLYING)',
      badgeClass: 'bg-white/10 backdrop-blur-md border border-white/25 text-[#FAF8F5] font-extrabold shadow-sm',
      isZeroStock: false,
    },
    {
      name: '@flexghy',
      label: 'Guwahati Hub',
      url: 'https://instagram.com/flexghy',
      badgeText: '⚡ ACTIVE DISPATCHING',
      badgeClass: 'bg-white/10 backdrop-blur-md border border-white/25 text-[#FAF8F5] font-extrabold shadow-sm',
      isZeroStock: false,
    },
    {
      name: '@flexmoirabari',
      label: 'Moirabari Hub',
      url: '#catalog-products',
      badgeText: '🚨 0 STOCK • SHOP WEBSITE 👇',
      badgeClass: 'bg-white/10 backdrop-blur-md border border-white/25 text-[#FAF8F5] font-extrabold shadow-sm',
      isZeroStock: true,
    },
  ];

  return (
    <section className="relative w-full min-h-[36vh] sm:min-h-[42vh] bg-[#0D0D0D] text-[#FAF8F5] overflow-hidden border-b border-neutral-800/60 font-sans select-none flex flex-col justify-between p-3 sm:p-5 py-3">
      {/* Elegant Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#faf8f50a_1px,transparent_1px),linear-gradient(to_bottom,#faf8f50a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Soft Ambient Glow Mist */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-[#FAF8F5]/5 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none" />

      {/* CENTER STAGE: 3D Glossy Text & Compact Hero Layout */}
      <div className="relative z-10 my-auto py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center" style={{ perspective: 1200 }}>
        
        {/* Left Column: Active Hubs & Trust Proof */}
        <div className="lg:col-span-6 space-y-2.5 z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2.5"
          >
            {/* PAN-INDIA DELIVERY & 1200+ ORDERS TRUST BADGES */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 font-mono text-[8px] sm:text-[9px] uppercase font-extrabold tracking-widest bg-[#CCFF00] text-black rounded-full flex items-center gap-1 shadow-sm">
                <PackageCheck className="w-2.5 h-2.5" /> 1200+ ORDERS DELIVERED
              </span>
              <span className="px-2 py-0.5 font-mono text-[8px] sm:text-[9px] uppercase font-bold tracking-widest bg-[#171717] text-[#FAF8F5] border border-[#FAF8F5]/20 rounded-full flex items-center gap-1 shadow-sm">
                <Truck className="w-2.5 h-2.5 text-[#10B981]" /> PAN-INDIA SHIPPING
              </span>
            </div>

            {/* WELL-ALIGNED BOXED INSTAGRAM WAREHOUSE HUB CARDS */}
            <div className="flex flex-col items-start sm:items-end space-y-2 pt-1 sm:ml-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest text-[#CCFF00]">
                  LIVE WAREHOUSE STORES (INSTAGRAM)
                </span>
              </div>

              {/* Perfectly Aligned Premium Dark Boxed Cards */}
              <div className="flex flex-col gap-2 w-full sm:w-[280px]">
                {activeBranches.map((branch, idx) => (
                  <a
                    key={idx}
                    href={branch.url}
                    target={branch.isZeroStock ? '_self' : '_blank'}
                    rel={branch.isZeroStock ? undefined : 'noopener noreferrer'}
                    className={`group relative p-2.5 sm:p-3 rounded-2xl bg-[#171717]/95 border ${branch.isZeroStock ? 'border-[#EF4444]/40 hover:border-[#EF4444]' : 'border-white/15 hover:border-[#CCFF00]'} hover:bg-[#202020] transition-all duration-300 shadow-md flex flex-col gap-1.5 w-full`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#E4405F]/15 border border-[#E4405F]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#E4405F] transition-all">
                          <Instagram className="w-3.5 h-3.5 text-[#E4405F] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="luxury-title text-sm sm:text-base font-extrabold tracking-tight text-[#FAF8F5] group-hover:text-[#CCFF00] transition-colors leading-none">
                          {branch.name}
                        </h3>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00] group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {/* Stock Status & Location Label Row */}
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider pt-0.5">
                      <span className="text-neutral-400 font-medium">
                        {branch.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${branch.badgeClass}`}>
                        {branch.badgeText}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* High Retention Action CTAs */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <Link
              href="/shop"
              className="px-5 py-2 rounded-full bg-[#FAF8F5] text-black font-mono text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#CCFF00] hover:scale-105 transition-all shadow-sm inline-flex items-center gap-1"
            >
              Explore Collection <ArrowRight className="w-3 h-3" />
            </Link>

            <a
              href="#catalog-products"
              className="px-4 py-2 rounded-full bg-[#171717] border border-[#CCFF00] text-[#CCFF00] font-mono text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-all inline-flex items-center gap-1 shadow-sm group"
            >
              Catalog Products 👇 <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right Column: 3D Specular Liquid Tubing Title */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[140px] sm:min-h-[220px]">
          <motion.div
            style={{ rotateX, rotateY, z: textTranslateZ, transformStyle: 'preserve-3d' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="relative cursor-grab active:cursor-grabbing transform-gpu"
          >
            {/* 3D Liquid Tubing Text */}
            <div className="relative text-center">
              <h2 className="luxury-title text-5xl sm:text-7xl md:text-[8.5rem] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-[#FAF8F5] to-[#ECE7DB] drop-shadow-[0_22px_45px_rgba(0,0,0,0.95)] select-none">
                NenoFlex
              </h2>
              <div className="absolute inset-0 luxury-title text-5xl sm:text-7xl md:text-[8.5rem] font-extrabold tracking-tighter text-[#CCFF00]/20 blur-[2px] pointer-events-none mix-blend-color-dodge">
                NenoFlex
              </div>
            </div>

            {/* CLASSY FLOATING ACTIVE BRANCH STICKERS */}
            <motion.a
              href="https://instagram.com/flexnagaon"
              target="_blank"
              rel="noopener noreferrer"
              drag
              dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
              whileHover={{ scale: 1.15, rotate: 6 }}
              className="sticker-badge absolute -top-4 -right-1 px-2.5 py-0.5 bg-[#FAF8F5] text-black font-extrabold font-mono text-[9px] uppercase rounded shadow border border-black rotate-[-5deg] cursor-pointer flex items-center gap-1"
            >
              <Instagram className="w-2.5 h-2.5 text-[#E4405F]" />
              <span>@flexnagaon</span>
            </motion.a>

            <motion.a
              href="https://instagram.com/flexghy"
              target="_blank"
              rel="noopener noreferrer"
              drag
              dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
              whileHover={{ scale: 1.15, rotate: -8 }}
              className="sticker-badge absolute -bottom-4 left-1 px-2.5 py-0.5 bg-[#10B981] text-black font-mono text-[9px] font-extrabold uppercase rounded shadow border border-black rotate-[4deg] cursor-pointer flex items-center gap-1"
            >
              <Instagram className="w-2.5 h-2.5 text-black" />
              <span>@flexghy</span>
            </motion.a>

          </motion.div>
        </div>
      </div>

      {/* SIMPLE & CLASSY FOOTER STATUS HUD */}
      <footer className="relative z-20 flex items-center justify-between border-t border-[#FAF8F5]/10 pt-2 font-mono text-[10px] sm:text-xs text-[#ECE7DB]/70 tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>+91 IN {timeStr}</span>
        </div>

        <div className="flex items-center gap-3 text-center text-[#FAF8F5] font-semibold text-[10px] sm:text-[11px]">
          <span className="hidden sm:inline">{String(coords.x).padStart(4, '0')} X {String(coords.y).padStart(4, '0')} Y •</span>
          <a href="#catalog-products" className="text-[#CCFF00] hover:underline font-bold flex items-center gap-1">
            <span>PAN-INDIA VAULT</span> 👇
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-[#ECE7DB]/80">
          <span>PAN-INDIA</span>
          <Globe className="w-3.5 h-3.5 text-[#CCFF00] animate-spin" style={{ animationDuration: '14s' }} />
        </div>
      </footer>
    </section>
  );
};
