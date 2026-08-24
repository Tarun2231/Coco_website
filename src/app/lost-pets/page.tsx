import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { db } from '@/lib/db';
import { AlertTriangle, MapPin, Calendar, PhoneCall, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function LostPetsPage() {
  const lostPets = await db.pet.findMany({
    where: { isLost: true },
    include: {
      user: {
        select: { name: true, phone: true, email: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header */}
        <div className="bg-rose-600 text-white rounded-3xl p-8 shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Public Emergency Search</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Active Lost Pets Directory</h1>
            <p className="text-rose-100 text-sm max-w-xl">
              Have you seen any of these missing pets? Browse active lost pet reports and help bring them home to their families.
            </p>
          </div>
        </div>

        {/* Pet Grid */}
        {lostPets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ❤️
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Active Lost Pets</h3>
            <p className="text-sm text-slate-500 mt-2">
              All registered pets are currently safe at home with their owners!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all group"
              >
                <div>
                  <div className="relative h-60 overflow-hidden bg-slate-100">
                    <img
                      src={pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop'}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>LOST PET</span>
                    </div>

                    {pet.rewardAmount && (
                      <div className="absolute bottom-4 right-4 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                        🏆 {pet.rewardAmount}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{pet.name}</h3>
                      <p className="text-xs font-bold text-brand-coral uppercase tracking-wider mt-0.5">
                        {pet.breed} • {pet.gender}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {pet.lastSeenLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Last seen: <strong className="text-slate-800">{pet.lastSeenLocation}</strong></span>
                        </div>
                      )}

                      {pet.lastSeenDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Date: <strong className="text-slate-800">{formatDate(pet.lastSeenDate)}</strong> {pet.lastSeenTime}</span>
                        </div>
                      )}
                    </div>

                    {pet.lostNotes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                        &quot;{pet.lostNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <Link href={`/pet/${pet.publicId}`} className="flex-1">
                    <button className="w-full py-3 bg-brand-coral hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors">
                      <span>View Public QR Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </Link>

                  {pet.user?.phone && (
                    <a
                      href={`tel:${pet.user.phone}`}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
                      title="Call Owner Now"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
