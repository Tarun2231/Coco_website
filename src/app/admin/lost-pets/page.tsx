import React from 'react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, MapPin, PhoneCall, UserCheck, Navigation } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminLostPetsPage() {
  const lostPets = await db.pet.findMany({
    where: { isLost: true },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      finderMessages: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          <span>Active Lost Pet Location & Rescue Tracker</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          Track reported lost pet locations, GPS pins, and handover caretakers where you can retrieve the puppy
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-6">
        {lostPets.length === 0 ? (
          <p className="text-slate-400 text-center py-8 text-sm">No active lost pets currently reported.</p>
        ) : (
          lostPets.map((pet) => (
            <div key={pet.id} className="bg-slate-900 border border-rose-500/30 p-6 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <img src={pet.photo || ''} alt={pet.name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-rose-500" />
                  <div>
                    <h3 className="font-extrabold text-white text-lg">{pet.name}</h3>
                    <p className="text-xs text-rose-400 font-semibold">{pet.breed} • Owner: {pet.user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-extrabold text-xs rounded-full border border-rose-500/40 animate-pulse">
                    🚨 LOST MODE
                  </span>
                  <Link href={`/pet/${pet.publicId}`} target="_blank" className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700">
                    View Public QR Profile &rarr;
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl text-xs space-y-2 text-slate-300 border border-slate-800">
                  <span className="text-amber-500 font-bold uppercase tracking-wider block text-[10px]">Owner Information</span>
                  <div><strong>Owner Name:</strong> {pet.user?.name}</div>
                  <div><strong>Owner Phone:</strong> {pet.user?.phone}</div>
                  <div><strong>Last Seen Spot:</strong> {pet.lastSeenLocation || 'Banjara Hills, Hyderabad'}</div>
                  <div><strong>Reward:</strong> {pet.rewardAmount || '₹5,000 Cash Reward'}</div>
                </div>

                {/* Latest Finder Location / Caretaker Handover Box */}
                <div className="bg-slate-950 p-4 rounded-2xl text-xs space-y-2 border border-slate-800 text-slate-200">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px]">Latest Reported Finder / Handover Location</span>
                  {pet.finderMessages && pet.finderMessages.length > 0 ? (
                    (() => {
                      const latest = pet.finderMessages[0];
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-white text-sm">{latest.senderName}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(latest.createdAt, 'dd MMM, hh:mm a')}</span>
                          </div>

                          <div className="text-slate-300 italic">&quot;{latest.message}&quot;</div>

                          {latest.finderLocation && (
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Found Spot: {latest.finderLocation}</span>
                            </div>
                          )}

                          {latest.hasHandedOver && (
                            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                              <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                Handover Caretaker: {latest.handoverName} ({latest.handoverPhone})
                              </span>
                              <div className="text-slate-300">Pickup Address: {latest.handoverLocation}</div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-slate-500 italic py-2">No finder location messages submitted yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
