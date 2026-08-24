'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PawPrint, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@puppyid.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          document.cookie = `puppy_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60};`;
        }

        if (data.user?.role === 'ADMIN' || email.includes('admin')) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 max-w-md w-full animate-fadeIn">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-coral text-white flex items-center justify-center mx-auto shadow-md">
            <PawPrint className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back to Puppy ID</h1>
          <p className="text-xs text-slate-500 font-medium">Log into your owner dashboard to manage your pets</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@puppyid.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-brand-coral hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-coral"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full font-bold shadow-md shadow-brand-coral/20 mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-brand-coral hover:underline">
            Register for Free
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Demo Quick Logins:</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setEmail('owner@puppyid.com');
                setPassword('password123');
              }}
              className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg"
            >
              Demo Owner
            </button>
            <button
              onClick={() => {
                setEmail('admin@puppyid.com');
                setPassword('adminpassword123');
              }}
              className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
