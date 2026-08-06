'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-white text-black flex flex-col items-center justify-center text-center p-8 space-y-4 font-sans">
      <h1 className="luxury-title text-6xl font-bold">404</h1>
      <h2 className="text-xl font-bold uppercase font-mono tracking-wider">Grail Not Found</h2>
      <p className="text-xs text-neutral-500 max-w-sm">
        The vault drop or page you are looking for has been moved, sold out, or does not exist.
      </p>
      <Link
        href="/shop"
        className="px-8 py-3 rounded-full bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800"
      >
        Back to Shop Vault
      </Link>
    </div>
  );
}
