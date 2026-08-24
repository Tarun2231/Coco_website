'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PawPrint,
  LayoutDashboard,
  Dog,
  Syringe,
  DollarSign,
  Bell,
  QrCode,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  unreadMessagesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadMessagesCount = 2 }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'puppy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Puppy Profile', href: '/dashboard/profile', icon: Dog },
    { label: 'Vaccinations', href: '/dashboard/vaccinations', icon: Syringe },
    { label: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
    { label: 'Reminders', href: '/dashboard/reminders', icon: Bell },
    { label: 'QR Code', href: '/dashboard/qr-code', icon: QrCode },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/dashboard/profile', icon: Dog },
    { label: 'Vaccines', href: '/dashboard/vaccinations', icon: Syringe },
    { label: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 bg-navy-900 text-slate-300 flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-2xl bg-brand-coral text-white flex items-center justify-center shadow-md">
            <PawPrint className="w-6 h-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white leading-tight">
              Puppy <span className="text-brand-coral">ID</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Pet Management
            </span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group',
                  isActive
                    ? 'bg-brand-coral text-white shadow-md shadow-brand-coral/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-bold rounded-full',
                      isActive ? 'bg-white text-brand-coral' : 'bg-brand-coral text-white'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (visible on mobile < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-900 text-slate-300 border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all relative',
                isActive ? 'text-brand-coral' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-brand-coral' : 'text-slate-400')} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-brand-coral text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
