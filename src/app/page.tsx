import React from 'react';
import { getAllPets } from '@/lib/store';
import { AdminPetsClient } from './admin/pets/AdminPetsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const pets = getAllPets();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Puppy ID Platform Admin Studio</span>
        </div>
        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Vercel Storage Active & System Online</span>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        <AdminPetsClient initialPets={JSON.parse(JSON.stringify(pets))} />
      </main>
    </div>
  );
}
