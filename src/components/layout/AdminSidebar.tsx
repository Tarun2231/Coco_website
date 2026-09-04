'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PawPrint,
  LayoutDashboard,
  Dog,
  AlertTriangle,
  Users,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Studio Registry', href: '/admin/pets', icon: Dog },
    { label: 'Admin Home', href: '/admin', icon: LayoutDashboard },
    { label: 'Lost Emergencies', href: '/admin/lost-pets', icon: AlertTriangle },
    { label: 'Owner Profile', href: '/admin/profile', icon: User },
    { label: 'Users Oversight', href: '/admin/users', icon: Users },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white text-slate-800 flex-col h-screen sticky top-0 border-r border-slate-200/80 shrink-0 shadow-xs">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-brand-coral text-white flex items-center justify-center font-bold shadow-md shadow-brand-coral/20">
          <PawPrint className="w-6 h-6 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight text-slate-900">
            Puppy <span className="text-brand-coral">Admin</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Platform Control Studio
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/admin/pets' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all',
                isActive
                  ? 'bg-brand-coral/10 text-brand-coral border border-brand-coral/20 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4 text-brand-coral" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-center">
        <span className="text-[11px] font-bold text-slate-400">
          Puppy ID v2.0 • Light Theme
        </span>
      </div>
    </aside>
  );
};
