'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdmin } from '@/app/actions/auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('owner@fairyfindsboutique.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        window.location.href = from || '/admin';
      } else {
        setError(res.error || 'Incorrect password. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300 border border-neutral-200 shadow-sm">
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
            Boutique
          </span>
        </Link>
        <h2 className="mt-6 font-serif text-2xl text-[#1A1A1A] font-light">
          Admin Panel Sign In
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enter the secure boutique passkey to access inventory, stock, and CMS.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-neutral-200 sm:px-10 space-y-6 rounded-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xs flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                Owner Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2] transition-colors"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700">
                  Admin Passkey
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 pr-10 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2] transition-colors"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3.5 px-4 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:bg-neutral-300 text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-md rounded-xs active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-neutral-100 pt-4 text-center">
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-black uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to live boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs text-neutral-400">
          Loading Admin Portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
