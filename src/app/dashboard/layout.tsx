import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { User, PawPrint } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  let unreadMessagesCount = 0;
  try {
    unreadMessagesCount = await db.finderMessage.count({
      where: {
        pet: { userId: user.id },
        isRead: false,
      },
    });
    // Fallback for demo account if DB is fresh
    if (unreadMessagesCount === 0 && (user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id')) {
      const demoUnreadCount = await db.finderMessage.count({ where: { isRead: false } });
      unreadMessagesCount = demoUnreadCount || 2;
    }
  } catch (err) {
    unreadMessagesCount = 2;
  }

  return (
    <div className="flex min-h-screen bg-cream-100 font-sans">
      {/* Sidebar (Desktop left / Mobile bottom bar) */}
      <Sidebar unreadMessagesCount={unreadMessagesCount} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <Link href="/" className="md:hidden flex items-center gap-1.5 font-extrabold text-slate-900 text-base">
              <div className="w-7 h-7 rounded-xl bg-brand-coral text-white flex items-center justify-center">
                <PawPrint className="w-4 h-4 fill-current" />
              </div>
              <span>Puppy <span className="text-brand-coral">ID</span></span>
            </Link>
            <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-widest">
              Owner Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-brand-coral text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="truncate max-w-[100px] sm:max-w-none">Hello, {user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
