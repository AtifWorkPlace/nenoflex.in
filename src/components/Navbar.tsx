'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Search, User, Menu, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const DEFAULT_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Sweatshirts', href: '/shop?category=Sweatshirts' },
  { label: 'Jerseys', href: '/shop?category=Jerseys' },
  { label: 'Jackets', href: '/shop?category=Jackets' },
  { label: 'Hoodies', href: '/shop?category=Hoodies' },
  { label: 'Shop All', href: '/shop?category=All' },
];

export const Navbar: React.FC = () => {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const { wishlist, cart, setIsCartOpen, setFilters, siteSettings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Use admin-controlled navLinks, fall back to defaults
  const navLinks = (siteSettings.navLinks && siteSettings.navLinks.length > 0)
    ? siteSettings.navLinks
    : DEFAULT_NAV_LINKS;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setFilters(prev => ({ ...prev, searchQuery: searchInput }));
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black text-white border-b border-neutral-800">
      {/* Top Announcement Bar */}
      <div className="bg-black text-neutral-300 text-xs py-1.5 px-4 text-center border-b border-neutral-800 font-mono tracking-widest">
        {siteSettings.announcementBanner}
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Navigation Categories Left — Dynamic from Admin */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
          {navLinks.map((link, i) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href.split('?')[0]) && link.href !== '/';
            return (
              <Link
                key={i}
                href={link.href}
                className={`transition-colors hover:text-white ${
                  isActive ? 'text-white border-b-2 border-white pb-0.5' : 'text-neutral-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="luxury-title text-2xl font-bold tracking-tight text-white">
            Neno<span className="italic font-normal">Flex</span>
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-neutral-300 hover:text-white transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            href="/dashboard?tab=wishlist"
            className="p-2 text-neutral-300 hover:text-white relative transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {Array.from(new Set(wishlist)).length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {Array.from(new Set(wishlist)).length}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-neutral-300 hover:text-white relative transition-colors"
            title="Cart Drawer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {cartItemsCount}
              </span>
            )}
          </button>

          <Link
            href="/dashboard"
            className="p-2 text-neutral-300 hover:text-white transition-colors"
            title="Customer Account"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      {/* Search Bar */}
      {searchOpen && (
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search grails, jerseys, jackets, brands..."
              className="flex-1 px-4 py-3 rounded-full bg-black border border-neutral-700 text-white text-xs focus:outline-none focus:border-white font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 uppercase cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer — Dynamic from Admin */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-6 py-6 space-y-3 font-semibold text-sm">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block transition-colors hover:text-white ${
                pathname === link.href ? 'text-white' : 'text-neutral-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
