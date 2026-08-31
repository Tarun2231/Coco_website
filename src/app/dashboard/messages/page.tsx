import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessageSquare, MapPin, PhoneCall, UserCheck, AlertTriangle, Navigation } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const messages = await db.finderMessage.findMany({
    where: { pet: { userId: user.id } },
    include: { pet: { select: { name: true, photo: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Location & Rescue Tracker</h1>
          <p className="text-sm text-slate-500 font-medium">
            Real-time GPS locations and caretaker handover details reported by finders
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Location Alerts Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              When someone scans your pet tag and submits location or handover info, rescue alerts appear here.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                msg.hasHandedOver ? 'border-amber-300 bg-amber-50/20' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center ${
                      msg.hasHandedOver ? 'bg-amber-500 text-white' : 'bg-brand-coral/10 text-brand-coral'
                    }`}
                  >
                    {msg.hasHandedOver ? <UserCheck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{msg.senderName}</h3>
                      {msg.hasHandedOver && (
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                          🤝 Handed Over to Caretaker
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Spotted <strong className="text-slate-800">{msg.pet?.name}</strong> • {formatDate(msg.createdAt, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>

                {msg.senderPhone && (
                  <a
                    href={`tel:${msg.senderPhone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Finder: {msg.senderPhone}</span>
                  </a>
                )}
              </div>

              {/* Message Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">&quot;{msg.message}&quot;</p>

                {msg.finderLocation && (
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Found Spot: <strong className="text-slate-900">{msg.finderLocation}</strong></span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.finderLocation)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold shrink-0 text-[11px]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Map</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Handover Caretaker Rescue Box (If Finder was busy and handed over) */}
              {msg.hasHandedOver && (
                <div className="bg-amber-100/70 border-2 border-amber-300 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                      <UserCheck className="w-5 h-5 text-amber-800" />
                      <span>Retrieval Location & Caretaker Info</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-900 uppercase bg-white px-2.5 py-1 rounded-full border border-amber-300">
                      Go Here To Bring Puppy Home
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-amber-800 font-bold block">Caretaker Name:</span>
                      <span className="font-black text-slate-900 text-sm">{msg.handoverName || 'Local Caretaker'}</span>
                    </div>
                    <div>
                      <span className="text-amber-800 font-bold block">Caretaker Phone:</span>
                      <a href={`tel:${msg.handoverPhone}`} className="font-black text-emerald-800 text-sm hover:underline">
                        {msg.handoverPhone || 'N/A'}
                      </a>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-amber-800 font-bold block">Exact Pickup Address / Shop:</span>
                      <span className="font-extrabold text-slate-900">{msg.handoverLocation || msg.finderLocation}</span>
                    </div>
                    {msg.handoverNotes && (
                      <div className="md:col-span-2 pt-1">
                        <span className="text-amber-800 font-bold block">Pickup Notes:</span>
                        <span className="italic text-slate-800">&quot;{msg.handoverNotes}&quot;</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {msg.handoverPhone && (
                      <a
                        href={`tel:${msg.handoverPhone}`}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Caretaker ({msg.handoverName?.split(' ')[0]})</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.handoverLocation || msg.finderLocation || '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4 text-amber-400" />
                      <span>Navigate To Pickup Spot</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
