'use client';

import React, { Suspense } from 'react';
import PaymentPageInner from './[orderId]/page';

export default function CheckoutPaymentQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-4 font-mono">
          <div className="w-12 h-12 border-2 border-neutral-700 border-t-[#CCFF00] rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">Loading Secure Payment...</p>
        </div>
      }
    >
      <PaymentPageInner />
    </Suspense>
  );
}
