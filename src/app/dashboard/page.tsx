'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Heart,
  User,
  Tag,
  MapPin,
  LogIn,
  LogOut,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'wishlist';

  const { orders, wishlist, products, customerUser, customerLogout } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Derived unique wishlist items from master catalog
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-neutral-800 border border-white/10 text-white font-bold text-xl flex items-center justify-center font-mono shrink-0">
            {customerUser ? (
              customerUser.name?.slice(0, 2).toUpperCase() || customerUser.email.slice(0, 2).toUpperCase()
            ) : (
              <User className="w-7 h-7 text-neutral-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {customerUser ? customerUser.name || customerUser.email.split('@')[0] : 'Guest Vault Shopper'}
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              {customerUser ? customerUser.email : "You're currently shopping as a guest"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {customerUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Verified Member
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-white/10 text-[10px] font-mono font-bold">
                  Guest Shopper
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {customerUser ? (
            <button
              onClick={customerLogout}
              className="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-lg"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Register
              </Link>
              <Link
                href="/shop"
                className="px-4 py-2.5 rounded-full bg-neutral-900 border border-white/10 text-white text-xs font-mono font-bold hover:bg-neutral-800 transition-all"
              >
                Shop Drops
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {[
          { id: 'wishlist', label: `My Wishlist (${wishlistedProducts.length})`, icon: Heart },
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'coupons', label: 'Coupon Wallet', icon: Tag },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                active
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase font-bold text-white tracking-wider">
              Saved Vault Grails ({wishlistedProducts.length})
            </h2>
            {wishlistedProducts.length > 0 && (
              <Link href="/shop" className="text-xs text-[#CCFF00] hover:underline font-mono">
                Continue Shopping &rarr;
              </Link>
            )}
          </div>

          {wishlistedProducts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#171717]/40 border border-white/10 text-center space-y-4">
              <Heart className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Your Wishlist is Empty</h3>
                <p className="text-neutral-400 text-xs">Save your favorite vintage jackets, jerseys, and hoodies to review later.</p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold font-mono text-xs uppercase hover:bg-neutral-200 transition-all shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" /> Explore Vault Drops
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistedProducts.map(p => (
                <ProductCard key={p.id} product={p} theme="dark" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#171717]/40 border border-white/10 text-center space-y-4">
              <Package className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Active or Past Orders</h3>
                <p className="text-neutral-400 text-xs">Orders you place with express dispatch will appear here with live tracking.</p>
              </div>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-full bg-white text-black font-bold font-mono text-xs uppercase hover:bg-neutral-200 transition-all"
              >
                Start Shopping <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-6 rounded-3xl bg-[#171717] border border-white/10 space-y-6">
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Order ID</span>
                    <h3 className="text-base font-bold text-white font-mono">{order.id}</h3>
                    <p className="text-xs text-neutral-400" suppressHydrationWarning>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                      Status: {order.status}
                    </span>
                    <p className="text-xs text-white font-mono font-bold mt-1">Total: ₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Visual Progress Steps */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Courier: <strong className="text-white">{order.courier || 'Bluedart Express'}</strong></span>
                    <span className="text-emerald-400 font-bold">Tracking: {order.trackingCode || 'NF-TRK-' + order.id.slice(-6)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-mono">
                    {['Placed', 'Authenticated', 'Shipped', 'Delivered'].map((st, idx) => {
                      const stages = ['Placed', 'Authenticated', 'Quality Checked', 'Shipped', 'Out for Delivery', 'Delivered'];
                      const currentIdx = stages.indexOf(order.status);
                      const isComplete = currentIdx >= idx * 1.5;
                      return (
                        <div key={idx} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isComplete ? 'bg-emerald-400' : 'bg-white/10'
                            }`}
                          />
                          <span className={isComplete ? 'text-white font-bold' : 'text-neutral-500'}>
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center text-xs">
                      <img src={item.product.image} alt="Thumb" className="w-14 h-16 object-cover rounded-xl bg-neutral-900" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-white truncate">{item.product.name}</h5>
                        <p className="text-neutral-400 font-mono text-[11px]">Brand: {item.product.brand} • Size: {item.selectedSize}</p>
                      </div>
                      <span className="font-mono text-white font-bold">₹{item.product.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[#171717] border border-emerald-500/30 space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              ACTIVE VOUCHER
            </span>
            <h3 className="text-xl font-mono font-bold text-white">FLEX10</h3>
            <p className="text-xs text-neutral-400">10% Extra Off on any order over ₹500.</p>
          </div>
          <div className="p-6 rounded-3xl bg-[#171717] border border-white/10 space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono font-bold">
              WELCOME VOUCHER
            </span>
            <h3 className="text-xl font-mono font-bold text-white">THRIFT90</h3>
            <p className="text-xs text-neutral-400">15% Extra Off on first imported Tokyo drop order.</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="p-8 rounded-3xl bg-[#171717] border border-white/10 space-y-4 text-center sm:text-left">
          <h3 className="font-bold text-white text-sm">Delivery Addresses</h3>
          <p className="text-xs text-neutral-400">
            {customerUser
              ? 'Addresses entered during checkout will be saved here for express 1-click re-ordering.'
              : 'No saved addresses yet. You are shopping as a guest.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-xs font-mono text-neutral-400">Loading Vault Dashboard...</div>}>
      <CustomerDashboardContent />
    </Suspense>
  );
}
