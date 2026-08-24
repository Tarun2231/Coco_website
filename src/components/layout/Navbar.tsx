'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PawPrint, User, Search, ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-coral transition-colors">
            Home
          </Link>
          <Link
            href="/lost-pets"
            className="hover:text-brand-coral transition-colors flex items-center gap-1.5 text-rose-600 font-semibold"
          >
            <Search className="w-4 h-4" />
            Lost Pets Directory
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand-coral transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-brand-coral transition-colors">
            Features
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="text-xs px-3 py-1.5">
              Dashboard
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/lost-pets"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-extrabold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Lost Pets Directory</span>
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50"
          >
            Features
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center">
                My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
