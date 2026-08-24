import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';

export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-cream-100 font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar unreadMessagesCount={2} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Owner Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-brand-coral text-white flex items-center justify-center font-bold text-[10px]">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span>Hello, {user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
