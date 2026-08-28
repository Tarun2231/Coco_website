'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PawPrint,
  LayoutDashboard,
  Users,
  Dog,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'puppy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const navItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Dog Registry & QR', href: '/admin/pets', icon: Dog },
    { label: 'Puppy Profile', href: '/admin/profile', icon: User },
    { label: 'Lost Pets & Caretakers', href: '/admin/lost-pets', icon: AlertTriangle },
    { label: 'Users Oversight', href: '/admin/users', icon: Users },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
          <PawPrint className="w-6 h-6 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-white">
            Puppy <span className="text-amber-500">Admin</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
            Platform Control
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </aside>
  );
};
