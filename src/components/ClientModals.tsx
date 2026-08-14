'use client';

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/CartDrawer').then(m => m.CartDrawer), { ssr: false });
const QuickViewModal = dynamic(() => import('@/components/QuickViewModal').then(m => m.QuickViewModal), { ssr: false });
const PromoModal = dynamic(() => import('@/components/PromoModal').then(m => m.PromoModal), { ssr: false });
const HaoqiCreamCursor3D = dynamic(() => import('@/components/HaoqiCreamCursor3D').then(m => m.HaoqiCreamCursor3D), { ssr: false });

export function ClientModals() {
  return (
    <>
      <HaoqiCreamCursor3D />
      <CartDrawer />
      <QuickViewModal />
      <PromoModal />
    </>
  );
}
