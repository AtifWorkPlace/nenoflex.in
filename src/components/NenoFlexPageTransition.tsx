'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface TileData {
  id: number;
  left: string;
  top: string;
  width: string;
  height: string;
  bg: string;
  delayCover: number;
  isNeon: boolean;
}

// Seeded deterministic pseudo-random generator
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate NenoFlex Matte Black Staggered Mosaic Tile Field (Mixed Squares & Rectangles)
function generateMosaicTiles(isMobile: boolean): TileData[] {
  const cols = isMobile ? 8 : 12;
  const rows = isMobile ? 6 : 9;
  const tiles: TileData[] = [];

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      count++;
      const seed = r * 19 + c * 33 + (isMobile ? 80 : 180);
      const rand1 = pseudoRandom(seed);
      const rand2 = pseudoRandom(seed + 1);
      const rand3 = pseudoRandom(seed + 2);

      const baseLeft = (c / cols) * 100;
      const baseTop = (r / rows) * 100;
      const widthPct = (1.0 / cols) * 100 + (rand1 * 0.6 - 0.3);
      const heightPct = (1.0 / rows) * 100 + (rand2 * 0.6 - 0.3);

      // Matte Black Luxury Color Palette (97% Charcoal/Matte Black, 3% Sparingly Volt Neon)
      let bg = '#111111';
      let isNeon = false;

      if (rand3 < 0.60) {
        bg = '#111111';
      } else if (rand3 < 0.86) {
        bg = '#171717';
      } else if (rand3 < 0.97) {
        bg = '#202020';
      } else {
        bg = '#CCFF00';
        isNeon = true;
      }

      // Radial/diagonal wave stagger algorithm (2ms - 10ms micro-delays)
      const centerX = (cols - 1) / 2;
      const centerY = (rows - 1) / 2;
      const dist = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));
      const delayCover = dist * 0.016 + rand1 * 0.03;

      tiles.push({
        id: count,
        left: `${baseLeft.toFixed(2)}%`,
        top: `${baseTop.toFixed(2)}%`,
        width: `${widthPct.toFixed(2)}%`,
        height: `${heightPct.toFixed(2)}%`,
        bg,
        delayCover: Number(delayCover.toFixed(3)),
        isNeon,
      });
    }
  }

  return tiles;
}

function NenoFlexPageTransitionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  // Viewport detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tiles = useMemo(() => generateMosaicTiles(isMobile), [isMobile]);

  // Trigger instant route transition without delaying router.push
  const triggerTransition = useCallback((url: string) => {
    // Respect reduced-motion accessibility preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(url);
      return;
    }

    // 1. DISPATCH ROUTER NAVIGATION IMMEDIATELY (0ms DELAY)
    router.push(url);

    // 2. OVERLAY ANIMATES CONCURRENTLY
    setIsAnimating(true);
  }, [router]);

  // Route change completion listener
  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
      if (!isAnimating) {
        setIsAnimating(true);
      }

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, currentPath, isAnimating]);

  // Safety cleanup timeout
  useEffect(() => {
    if (isAnimating) {
      const safetyTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 550);
      return () => clearTimeout(safetyTimer);
    }
  }, [isAnimating]);

  // Global Link Interception (0ms delay)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore hash links (#catalog-products), target="_blank", mailto/tel, or external URLs
      if (href.startsWith('#') || anchor.getAttribute('target') === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      const currentOrigin = window.location.origin;
      const targetUrl = new URL(href, window.location.href);

      if (targetUrl.origin === currentOrigin) {
        const isDifferentRoute = targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search;
        if (isDifferentRoute) {
          e.preventDefault();
          e.stopPropagation();

          // INSTANT NAVIGATION DISPATCH & CONCURRENT OVERLAY
          triggerTransition(targetUrl.pathname + targetUrl.search);
        }
      }
    };

    const handlePopState = () => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 380);
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [triggerTransition, isAnimating]);

  if (!isAnimating) return null;

  return (
    <AnimatePresence mode="wait">
      <div
        className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Dark Root Background */}
        <div className="absolute inset-0 bg-[#0D0D0D]/50" />

        {/* STAGGERED MOSAIC TILE WAVE (Matte Black Luxury) */}
        <div className="absolute inset-0">
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, scale: 0.92, translateY: 6 }}
              animate={{
                opacity: [0, tile.isNeon ? 0.85 : 0.96, 0],
                scale: [0.92, 1, 0.96],
                translateY: [6, 0, -4],
              }}
              transition={{
                duration: 0.38,
                delay: tile.delayCover,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="absolute border border-white/[0.04] overflow-hidden rounded-xs"
              style={{
                left: tile.left,
                top: tile.top,
                width: tile.width,
                height: tile.height,
                backgroundColor: tile.bg,
                willChange: 'transform, opacity',
              }}
            >
              {/* Micro Grain Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none opacity-30" />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
}

export const NenoFlexPageTransition: React.FC = () => (
  <React.Suspense fallback={null}>
    <NenoFlexPageTransitionContent />
  </React.Suspense>
);
