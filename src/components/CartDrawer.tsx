'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalMSRP = cart.reduce((acc, item) => acc + item.product.showroomPrice * item.quantity, 0);
  const totalSavings = totalMSRP - subtotal;

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  const finalTotal = subtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dark Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Panel - 100% Mobile Viewport Fit (Phone & PC) */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex pl-0 sm:pl-6 pointer-events-none">
        <div className="w-full bg-[#171717] border-l border-white/10 text-white flex flex-col shadow-2xl h-full pointer-events-auto">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">Your Vault Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Express Shipping Progress Bar */}
          <div className="px-4 sm:px-5 py-3 bg-neutral-900/80 border-b border-white/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px] sm:text-xs">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                {subtotal >= freeShippingThreshold ? (
                  <strong className="text-emerald-400">UNLOCKED FREE EXPRESS SHIPPING! 🚀</strong>
                ) : (
                  <span>
                    Add <strong className="text-white font-mono">₹{remainingForFreeShipping}</strong> more for Free Shipping
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-neutral-500">
                  <Tag className="w-8 h-8" />
                </div>
                <p className="text-neutral-400 text-sm">Your vault cart is currently empty.</p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors"
                >
                  Explore Drops Now
                </Link>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${idx}`}
                  className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 flex gap-3 items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-lg bg-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-semibold text-white truncate pr-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-neutral-500 hover:text-rose-400 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">
                        Size: {item.selectedSize}
                      </span>
                      <span className="truncate">{item.product.brand}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-neutral-900">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-neutral-500 line-through font-mono">
                          ₹{(item.product.showroomPrice * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon & Checkout Summary Section */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-neutral-900/80 border-t border-white/10 space-y-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs">
                  <span className="flex items-center gap-1 font-mono font-bold text-[11px]">
                    <Tag className="w-3 h-3" /> {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                  </span>
                  <button onClick={removeCoupon} className="text-neutral-400 hover:text-white text-xs underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. FLEX10)"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white uppercase focus:outline-none focus:border-white/40"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-rose-400 text-[11px]">{couponError}</p>}

              {/* MSRP Savings Summary Callout */}
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between text-[11px]">
                <span>Showroom MSRP Savings:</span>
                <span className="font-bold font-mono text-emerald-400">₹{totalSavings.toLocaleString()} OFF</span>
              </div>

              {/* Order Breakdown */}
              <div className="space-y-1 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-mono text-emerald-400">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '₹80'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>Total</span>
                  <span className="font-mono text-white">
                    ₹{(finalTotal + (subtotal >= freeShippingThreshold ? 0 : 80)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
              >
                Proceed to One-Page Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
