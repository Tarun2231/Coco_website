import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    // If not admin, redirect to login
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Platform Admin Portal</span>
          </div>
          <div className="text-xs font-bold text-slate-400">Logged in as {user.name} ({user.email})</div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
