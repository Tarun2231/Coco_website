import React from 'react';
import { getAllPets } from '@/lib/store';
import { AdminPetsClient } from './admin/pets/AdminPetsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const pets = getAllPets();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-brand-coral uppercase tracking-widest bg-brand-coral/10 px-3 py-1 rounded-full border border-brand-coral/20">
            🐾 Puppy ID Admin Studio
          </span>
        </div>
        <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Vercel Cloud Active • System Online</span>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        <AdminPetsClient initialPets={JSON.parse(JSON.stringify(pets))} />
      </main>
    </div>
  );
}
