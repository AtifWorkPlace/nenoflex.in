'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types';
import { ShieldCheck, Copy, Check, Clock, AlertTriangle, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { orders, submitOrderPayment, showToast } = useStore();

  const rawOrderId = (params?.orderId as string) || searchParams.get('orderId') || '';
  const orderId = decodeURIComponent(rawOrderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(290);
  const [isExpired, setIsExpired] = useState(false);

  // 1. Fetch Authoritative Order Snapshot from Server / Client Store
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const localOrder = orders.find((o) => o.id === orderId);
    if (localOrder) {
      setOrder(localOrder);
      setLoading(false);
    }

    // Always fetch fresh server record for authoritative state & immutable snapshot
    fetch(`/api/orders?id=${encodeURIComponent(orderId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => console.warn('[PaymentPage Fetch Error]:', err))
      .finally(() => setLoading(false));
  }, [orderId, orders]);

  // 2. Resolve Dynamic UPI Details from Order Snapshot (Fallback to defaults if not set)
  const upiId = order?.paymentDetails?.upiId || '6000149918@fam';
  const payeeName = order?.paymentDetails?.payeeName || 'NenoFlex';
  const totalAmount = order?.total ?? 0;

  // 3. Construct Standard NPCI UPI URI
  const upiUri = useMemo(() => {
    if (!order) return '';
    const note = encodeURIComponent(`NenoFlex Order ${order.id}`);
    const pn = encodeURIComponent(payeeName);
    return `upi://pay?pa=${upiId}&pn=${pn}&am=${totalAmount}&tr=${order.id}&tn=${note}&cu=INR`;
  }, [order, upiId, payeeName, totalAmount]);

  // 4. Generate QR Code Data URL
  useEffect(() => {
    if (!upiUri) return;
    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('[QR Gen Error]:', err));
  }, [upiUri]);

  // 5. Dynamic Countdown Timer (Calculated strictly from server expiresAt snapshot)
  useEffect(() => {
    if (!order?.paymentDetails?.expiresAt) {
      setTimeLeft(290);
      return;
    }

    const calculateRemaining = () => {
      const expiry = new Date(order.paymentDetails!.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        setIsExpired(true);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUPI = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      showToast('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleIHavePaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmitting(true);
    const updated = await submitOrderPayment(order.id, utrInput);
    if (updated) {
      setOrder(updated);
    }
    setIsSubmitting(false);
  };

  // UPI App intent links
  const gpayUrl = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&tr=${order?.id || ''}&tn=NenoFlex%20Order&cu=INR`;
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&tr=${order?.id || ''}&tn=NenoFlex%20Order&cu=INR`;
  const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&tr=${order?.id || ''}&tn=NenoFlex%20Order&cu=INR`;
  const fampayUrl = `fampay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&tr=${order?.id || ''}&tn=NenoFlex%20Order&cu=INR`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-12 h-12 border-2 border-neutral-700 border-t-[#CCFF00] rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Secure Payment Session...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold font-mono uppercase">Order Session Not Found</h1>
        <p className="text-xs text-neutral-400 max-w-sm mt-2">
          Unable to locate active payment details for order {orderId || 'requested'}. Please check your order confirmation.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-3 rounded-full bg-white text-black font-mono font-bold text-xs uppercase hover:bg-neutral-200"
        >
          Return to Vault
        </Link>
      </div>
    );
  }

  const isSubmitted = order.status === 'Payment Submitted';
  const isPaid = order.status === 'Placed' || order.status === 'Authenticated' || order.status === 'Shipped';

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Top Navigation */}
      <header className="py-4 px-6 sm:px-12 border-b border-neutral-900 flex items-center justify-between bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="luxury-title text-xl font-bold text-white tracking-widest">
          NENOFLEX
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-BIT ENCRYPTED UPI
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* Breadcrumb / Back */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vault
        </Link>

        {/* PAYMENT SUBMITTED BANNER */}
        {isSubmitted && (
          <div className="mb-8 p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase">Payment Submitted for Verification</h2>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Thank you! Our executive team is verifying your transaction. Your items are locked and reserved.
                </p>
                {order.paymentDetails?.utrNumber && (
                  <p className="text-[11px] font-mono text-neutral-400 mt-2">
                    Reference / UTR: <span className="text-white font-bold">{order.paymentDetails.utrNumber}</span>
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs uppercase shrink-0 hover:bg-neutral-200 transition-colors"
            >
              View Order Status
            </Link>
          </div>
        )}

        {/* MAIN PAYMENT CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: QR & UPI Buttons (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Box */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Order Reference</span>
                <span className="text-xs font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full border border-[#CCFF00]/20">
                  {order.id}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-neutral-800">
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-mono">
                  Complete Your Payment
                </h1>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Countdown Timer */}
              <div className="pt-3 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {isExpired ? 'Payment Window Expired' : 'Payment Expires In'}
                </span>
                <span
                  className={`text-sm font-bold font-mono px-3 py-1 rounded-full ${
                    isExpired
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : timeLeft < 60
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/40'
                      : 'bg-neutral-800 text-white'
                  }`}
                >
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            {/* DYNAMIC QR CODE DISPLAY */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" /> Scan with any UPI App
              </span>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] duration-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="NenoFlex Official UPI QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-black font-mono text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Copy UPI ID Bar */}
              <div className="w-full max-w-sm pt-2">
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-neutral-700 hover:border-neutral-500 flex items-center justify-between text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer group"
                >
                  <span className="truncate">
                    UPI ID: <strong className="text-white">{upiId}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#CCFF00] font-bold text-[11px] shrink-0 ml-2">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Copy
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* INSTANT UPI APP BUTTONS */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                Or Pay Directly with App
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={gpayUrl}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700"
                >
                  Google Pay
                </a>
                <a
                  href={phonepeUrl}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700"
                >
                  PhonePe
                </a>
                <a
                  href={paytmUrl}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700"
                >
                  Paytm
                </a>
                <a
                  href={fampayUrl}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700"
                >
                  FamPay
                </a>
              </div>

              <a
                href={upiUri}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-black border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all text-center"
              >
                Open Default UPI App <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* "I HAVE PAID" FORM */}
            <form
              onSubmit={handleIHavePaid}
              className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold font-mono uppercase text-white">Confirm Payment</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  After completing the transfer in your UPI app, click below to mark your order submitted for verification.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1.5 uppercase">
                  Transaction UTR / Reference No. (Optional)
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. 423589214781"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-4 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmitted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-[#CCFF00] hover:bg-white text-black shadow-lg shadow-[#CCFF00]/10'
                }`}
              >
                {isSubmitting ? (
                  'Submitting Verification...'
                ) : isSubmitted ? (
                  <>
                    <Check className="w-4 h-4" /> Payment Submitted
                  </>
                ) : (
                  '⚡ I Have Paid'
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Items Summary Box */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider">
                Order Summary ({order.items.length} item{order.items.length !== 1 ? 's' : ''})
              </h3>

              <div className="divide-y divide-neutral-800 space-y-3 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover rounded-xl bg-neutral-800 border border-neutral-700"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-neutral-700 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 max-w-[160px]">
                        <p className="font-bold text-white truncate">{item.product.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">Size: {item.selectedSize}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">
                    {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="text-[#CCFF00]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Box */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
              <h3 className="text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider">
                Shipping Destination
              </h3>
              <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-400">{order.shippingAddress.address}</p>
              <p className="text-neutral-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-neutral-400 font-mono pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>

            {/* Support Box */}
            <div className="p-6 rounded-3xl bg-black border border-neutral-800 space-y-2 text-xs">
              <h4 className="font-bold font-mono uppercase text-white">Need Payment Assistance?</h4>
              <p className="text-neutral-400 leading-relaxed">
                Send your payment screenshot along with Order <strong className="text-white">#{order.id}</strong> to:
              </p>
              <div className="pt-1 space-y-1 font-mono text-[11px] text-neutral-300">
                <p>
                  WhatsApp: <strong className="text-white">+91 60001 49919</strong>
                </p>
                <p>
                  Instagram: <strong className="text-white">@flexnagaon</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
