'use client';

import React, { useEffect, useState } from 'react';

export const HaoqiCreamCursor3D: React.FC = () => {
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [follower, setFollower] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only activate custom 3D cursor on desktop fine-pointer devices (Android & iOS touch devices bypass this completely)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsPointerDevice(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerDevice(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    if (!mediaQuery.matches) return;

    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('a, button, input, select, textarea, [role="button"], .group, .clickable, .sticker-badge');
        setIsHovered(isInteractive);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    let currentX = -100;
    let currentY = -100;

    const render = () => {
      currentX += (pos.x - currentX) * 0.16;
      currentY += (pos.y - currentY) * 0.16;
      setFollower({ x: currentX, y: currentY });
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
      cancelAnimationFrame(animId);
    };
  }, [pos.x, pos.y, isVisible]);

  if (!isPointerDevice || !isVisible) return null;

  return (
    <>
      {/* Off-White & Cream 3D Arrow Pointer from haoqi.design */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] transition-transform duration-75 -translate-x-1 -translate-y-1"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${isHovered ? 1.25 : 1})`,
        }}
      >
        <svg
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter"
        >
          <path
            d="M5 5L32 18L18 22L12 33L5 5Z"
            fill="#FAF8F5"
            stroke="#ECE7DB"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 8L26 17.5L16.5 20.2L12.5 28L8 8Z"
            fill="url(#cream-arrow-gradient)"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="cream-arrow-gradient" x1="5" y1="5" x2="32" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#FAF8F5" />
              <stop offset="1" stopColor="#CCFF00" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Trailing Cream & Gold Star Badge */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99998] transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate3d(${follower.x - 18}px, ${follower.y + 18}px, 0) scale(${isHovered ? 1.3 : 1}) rotate(${follower.x * 0.1}deg)`,
        }}
      >
        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] text-black font-extrabold text-xs shadow-xl border border-black/30 flex items-center justify-center animate-pulse">
          <span className="text-[#F59E0B]">★</span>
        </div>
      </div>
    </>
  );
};
