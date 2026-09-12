'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect into admin dashboard
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Fairy Finds Logo"
              fill
              sizes="64px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif text-3xl tracking-[0.2em] font-semibold text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors uppercase">
            Fairy Finds
          </span>
          <span className="block text-[10px] tracking-[0.35em] text-neutral-400 uppercase font-sans mt-0.5">
            Boutique Atelier
          </span>
        </Link>
        <h2 className="mt-6 font-serif text-2xl text-[#1A1A1A] font-light">
          Owner Management Sign In
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Access product catalog, stock counts, and homepage section CMS.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md border border-neutral-200 sm:px-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                Owner Email
              </label>
              <input
                type="email"
                required
                placeholder="owner@fairyfindsboutique.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3.5 px-4 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-xs rounded-xs active:scale-[0.98] cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-neutral-100 pt-4 text-center">
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-black uppercase tracking-wider transition-colors"
            >
              ← Return to live boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
