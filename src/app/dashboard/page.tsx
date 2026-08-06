'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Heart,
  User,
  Truck,
  ShieldCheck,
  Tag,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const { orders, wishlist, products } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* User Header Profile Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-white text-black font-bold text-2xl flex items-center justify-center font-mono">
            AT
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Alex Turner</h1>
            <p className="text-xs text-neutral-400 font-mono">alex@nenoflex.com • VIP Vault Member</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Neno Flex Coins: 450 PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {[
          { id: 'orders', label: 'My Orders & Live Track', icon: Package },
          { id: 'wishlist', label: `Wishlist (${wishlistedProducts.length})`, icon: Heart },
          { id: 'coupons', label: 'Coupon Wallet', icon: Tag },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
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

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#171717]/40 border border-white/10 text-center space-y-3">
              <p className="text-neutral-400 text-sm">No active or past orders found.</p>
              <Link href="/shop" className="inline-block px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs">
                Explore Vault Drops
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

                {/* Live Delivery Timeline Tracker */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Courier: <strong className="text-white">{order.courier}</strong></span>
                    <span className="text-emerald-400 font-bold">Tracking Code: {order.trackingCode}</span>
                  </div>

                  {/* Visual Progress Steps */}
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

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#171717]/40 border border-white/10 text-center space-y-3">
              <p className="text-neutral-400 text-sm">Your wishlist is empty.</p>
              <Link href="/shop" className="inline-block px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs">
                Explore Grails
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
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
        <div className="p-6 rounded-3xl bg-[#171717] border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-sm">Default Delivery Address</h3>
          <p className="text-xs text-neutral-300">Alex Turner • +91 98765 43210</p>
          <p className="text-xs text-neutral-400">Penthouse 4B, HSR Layout Sector 1, Bengaluru, Karnataka - 560102</p>
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
