import React from 'react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, PhoneCall, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminLostPetsPage() {
  const lostPets = await db.pet.findMany({
    where: { isLost: true },
    include: { user: { select: { name: true, phone: true, email: true } } },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          <span>Active Lost Pet Emergency Reports</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium">Monitor active lost pet mode alerts platform-wide</p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        {lostPets.length === 0 ? (
          <p className="text-slate-400 text-center py-8 text-sm">No active lost pets currently reported.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostPets.map((pet) => (
              <div key={pet.id} className="bg-slate-900 border border-rose-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={pet.photo || ''} alt={pet.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className="font-extrabold text-white text-base">{pet.name}</h3>
                      <p className="text-xs text-rose-400 font-semibold">{pet.breed} • Owner: {pet.user?.name}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 font-bold text-[10px] rounded-full border border-rose-500/40 animate-pulse">
                    🚨 LOST MODE
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl text-xs space-y-1 text-slate-300">
                  <div><strong>Last Seen:</strong> {pet.lastSeenLocation || 'Banjara Hills, Hyderabad'}</div>
                  <div><strong>Reward:</strong> {pet.rewardAmount || '₹5,000 Cash Reward'}</div>
                  <div><strong>Owner Phone:</strong> {pet.user?.phone}</div>
                </div>

                <Link href={`/pet/${pet.publicId}`} target="_blank" className="block text-center py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl">
                  Inspect Public QR Page &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
