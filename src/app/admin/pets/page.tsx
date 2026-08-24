import React from 'react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPetsPage() {
  const pets = await db.pet.findMany({
    include: {
      user: { select: { name: true, email: true } },
      qrCode: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Pet Registry Oversight</h1>
        <p className="text-sm text-slate-400 font-medium">All registered digital pet profiles and public QR identifiers</p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Pet Name & Species</th>
                <th className="py-3 px-4">Breed & Gender</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Scans</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
              {pets.map((pet) => (
                <tr key={pet.id} className="hover:bg-slate-900 transition-colors">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                    <img src={pet.photo || ''} alt={pet.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <div>{pet.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">/pet/{pet.publicId}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{pet.breed} ({pet.gender})</td>
                  <td className="py-4 px-4 font-medium text-slate-300">{pet.user?.name}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        pet.isLost ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {pet.isLost ? '🚨 LOST' : 'SAFE'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-amber-500">{pet.qrCode?.scanCount || 0}</td>
                  <td className="py-4 px-4 text-right">
                    <Link href={`/pet/${pet.publicId}`} target="_blank" className="text-amber-400 hover:underline flex items-center justify-end gap-1 font-bold">
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
