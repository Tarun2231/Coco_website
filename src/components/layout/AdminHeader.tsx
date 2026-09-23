'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const AdminHeader: React.FC = () => {
  const router = useRouter();

  const handleSignOut = () => {
    document.cookie = 'puppy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-brand-coral uppercase tracking-widest bg-brand-coral/10 px-3 py-1 rounded-full border border-brand-coral/20 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>🐾 Admin Studio</span>
        </span>

        <Link
          href="/dashboard"
          className="hidden sm:inline-flex px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors"
        >
          &rarr; Go to Owner Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Cloud Active • System Online</span>
        </div>

        {/* ADMIN SIGN OUT BUTTON */}
        <button
          onClick={handleSignOut}
          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
