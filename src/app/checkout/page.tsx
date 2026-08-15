'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types';
import { Mail } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, appliedCoupon, applyCoupon, placeOrder, siteSettings } = useStore();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: 'Nagaon',
    state: 'Assam',
    pincode: '782001',
    phone: '',
  });

  const qrEnabled = siteSettings.paymentSettings?.qrPrepaidEnabled ?? true;
  const [paymentMethod, setPaymentMethod] = useState<'QR-PREPAID'>('QR-PREPAID');
  const [discountInput, setDiscountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;
  const shippingFee = subtotal > 999 ? 0 : 80;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountInput) {
      applyCoupon(discountInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrEnabled) return;
    setIsSubmitting(true);

    const newOrder = await placeOrder({
      shippingAddress: {
        fullName: `${formData.fullName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.apartment}`,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      paymentMethod: 'QR-PREPAID',
    });

    setIsSubmitting(false);
    if (newOrder) {
      // Transition directly to NenoFlex UPI Payment Page
      router.push(`/checkout/payment/${newOrder.id}`);
    }
  };

  // ORDER CONFIRMATION SCREEN
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-white text-black font-sans">
        {/* Top Header */}
        <header className="py-6 px-8 border-b border-neutral-200">
          <h1 className="luxury-title text-2xl font-bold text-black">NenoFlex</h1>
        </header>

        <div className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Main Confirmation Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header Status */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 font-bold">
                ✓
              </div>
              <div>
                <span className="text-xs text-neutral-500 font-mono">Confirmation #{completedOrder.id}</span>
                <h2 className="text-2xl font-bold text-black">Thank you, {completedOrder.shippingAddress.fullName}!</h2>
              </div>
            </div>

            {/* Map Snippet Preview Box */}
            <div className="rounded-xl border border-neutral-300 overflow-hidden bg-neutral-100 relative">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80"
                alt="Map snippet"
                className="w-full h-44 object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-neutral-200 text-center">
                  <span className="text-[10px] text-neutral-500 font-mono block">Shipping address</span>
                  <strong className="text-xs text-black">{completedOrder.shippingAddress.city} {completedOrder.shippingAddress.state}</strong>
                </div>
              </div>
            </div>

            {/* "Your order is confirmed" UPI/QR Instructions Box */}
            <div className="p-6 rounded-xl border border-neutral-300 bg-white space-y-3 text-xs leading-relaxed text-neutral-700">
              <h3 className="font-bold text-sm text-black">Your order is confirmed</h3>
              <ol className="list-decimal pl-4 space-y-2 text-neutral-800">
                <li>Copy and Paste the vpa/upi <strong className="font-mono text-black font-bold">6000149918@fam</strong> and complete the payment.</li>
                <li>Take a screenshot of the successful payment.</li>
                <li>Send the screenshot along with your Order Number (<strong className="font-mono text-black">{completedOrder.id}</strong>) to:</li>
              </ol>
              <div className="pl-4 pt-1 space-y-1 font-mono text-xs">
                <p>Instagram: <strong className="text-black">@flexnagaon</strong></p>
                <p>WhatsApp: <strong className="text-black">+91 60001 49919</strong></p>
              </div>
              <p className="pt-2 text-neutral-500 text-[11px]">4. Your order will be confirmed after payment verification.</p>
            </div>

            {/* Order Updates */}
            <div className="p-6 rounded-xl border border-neutral-300 bg-white space-y-3">
              <h4 className="font-bold text-sm text-black">Order updates</h4>
              <p className="text-xs text-neutral-600">You'll get shipping and delivery updates by email.</p>
              <button className="px-4 py-2.5 rounded-lg border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-50 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Get shipping updates by email
              </button>
            </div>

            {/* Order Details Summary */}
            <div className="p-6 rounded-xl border border-neutral-300 bg-white space-y-4 text-xs">
              <h4 className="font-bold text-sm text-black">Order details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-500 block">Contact information</span>
                  <strong className="text-black font-mono">{completedOrder.shippingAddress.phone}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Payment method</span>
                  <strong className="text-black">{completedOrder.paymentMethod} • ₹{completedOrder.total.toFixed(2)} INR</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-xl border border-neutral-200 space-y-4">
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.product.image} alt="Thumb" className="w-14 h-16 object-cover rounded-lg bg-neutral-200 border border-neutral-300" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-black leading-snug line-clamp-2 max-w-xs">{item.product.name}</h5>
                  </div>
                </div>
                <span className="font-mono font-bold text-black">₹{item.product.price.toFixed(2)}</span>
              </div>
            ))}

            <div className="pt-4 border-t border-neutral-300 space-y-2 text-xs text-neutral-600 font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{completedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{completedOrder.shippingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-300 flex justify-between text-sm font-bold text-black">
                <span>Total</span>
                <span>INR ₹{completedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM SCREEN
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Top Header */}
      <header className="py-6 px-8 border-b border-neutral-200">
        <h1 className="luxury-title text-2xl font-bold text-black">NenoFlex</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Contact Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Contact</h2>
              <Link href="/login" className="text-xs text-blue-600 hover:underline">Sign in</Link>
            </div>
            <input
              type="text"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email or mobile phone number"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black font-mono text-black"
              required
            />
            <p className="text-[11px] text-neutral-500">
              You may receive text messages related to order confirmation and shipping updates.
            </p>
          </div>

          {/* Delivery Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Delivery</h2>
            <div>
              <label className="block text-[11px] text-neutral-500 font-mono mb-1">Country/Region</label>
              <select className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs font-semibold bg-white">
                <option value="India">India</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="First name (optional)"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
                required
              />
            </div>

            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
              required
            />

            <input
              type="text"
              value={formData.apartment}
              onChange={e => setFormData({ ...formData, apartment: e.target.value })}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
            />

            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
                required
              />
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
                required
              />
              <input
                type="text"
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="PIN code"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Payment</h2>
            <p className="text-xs text-neutral-500">All transactions are secure and encrypted.</p>

            {qrEnabled ? (
              <div className="space-y-2">
                <label className="p-4 rounded-xl border border-black bg-neutral-50 flex items-center justify-between cursor-pointer transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={true}
                      readOnly
                      className="accent-black w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-black uppercase tracking-wider block font-mono">
                        QR-PREPAID
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Pay securely using UPI
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    INSTANT UPI
                  </span>
                </label>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-mono">
                ⚠️ Online UPI payments are temporarily paused by administrator. Please check back shortly.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0 || !qrEnabled}
            className="w-full py-4 rounded-lg bg-black text-white font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Processing Order...' : 'Complete Order'}
          </button>
        </div>

        {/* Right Summary Column (5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-xl border border-neutral-200 space-y-6">
          {/* Cart item summary */}
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.product.image} alt="Thumb" className="w-14 h-16 object-cover rounded-lg bg-neutral-200 border border-neutral-300" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-black leading-snug line-clamp-2 max-w-xs">{item.product.name}</h5>
                  </div>
                </div>
                <span className="font-mono font-bold text-black">₹{item.product.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Discount code box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={discountInput}
              onChange={e => setDiscountInput(e.target.value)}
              placeholder="Discount code"
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 text-xs text-black focus:outline-none focus:border-black"
            />
            <button
              onClick={handleApplyDiscount}
              type="button"
              className="px-5 py-3 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black font-bold text-xs"
            >
              Apply
            </button>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-neutral-600 font-mono">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{shippingFee.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-neutral-300 flex justify-between text-base font-bold text-black">
              <span>Total</span>
              <span>INR ₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
