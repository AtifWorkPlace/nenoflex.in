'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function LoginPage() {
  const router = useRouter();
  const { adminLogin, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Admin login check
    if (email.trim().toLowerCase().includes('admin@nenoflex.com')) {
      const success = await adminLogin(email, password);
      if (success) {
        router.push('/admin');
        return;
      } else {
        setErrorMsg('Invalid Admin credentials! Password should be admin123 or superadmin123');
        return;
      }
    }

    // Normal customer login
    showToast(`Welcome back, ${email.split('@')[0]}!`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] bg-white text-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-xl border border-neutral-200 shadow-xl bg-white">
        <div className="text-center space-y-2">
          <h1 className="luxury-title text-3xl font-bold text-black">NenoFlex</h1>
          <h2 className="text-lg font-bold text-black uppercase font-mono tracking-wider">Account Sign In</h2>
          <p className="text-xs text-neutral-500">Sign in to your account or enter admin credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 font-mono mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. customer@gmail.com or admin@nenoflex.com"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs text-black focus:outline-none focus:border-black font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-600 font-mono mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-xs text-black focus:outline-none focus:border-black font-mono"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-rose-600 font-mono text-[11px] bg-rose-50 p-2.5 rounded border border-rose-200">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-200 text-center space-y-3 text-xs">
          <p className="text-neutral-500">Shopping as a guest?</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-full border border-neutral-300 text-black font-bold uppercase text-[11px] hover:bg-neutral-100"
          >
            No Login Required — Shop Drops <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
