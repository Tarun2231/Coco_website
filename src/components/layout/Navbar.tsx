'use client';

import React from 'react';
import Link from 'next/link';
import { PawPrint, User, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-slate-900 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center group-hover:scale-105 transition-transform">
            <PawPrint className="w-6 h-6 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Puppy <span className="text-brand-coral">ID</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-coral transition-colors">
            Home
          </Link>
          <Link href="/lost-pets" className="hover:text-brand-coral transition-colors flex items-center gap-1.5 text-rose-600 font-semibold">
            <Search className="w-4 h-4" />
            Lost Pets Directory
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand-coral transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-brand-coral transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-brand-coral transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
              My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
