import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessageSquare, MapPin, PhoneCall, Clock, CheckCircle } from 'lucide-react';
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
          <h1 className="text-2xl font-extrabold text-slate-900">Finder Messages Inbox</h1>
          <p className="text-sm text-slate-500 font-medium">Direct messages and GPS locations sent by good samaritans who scanned your pet tag</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Messages Yet</h3>
            <p className="text-xs text-slate-500 mt-1">When someone scans your pet tag and submits a finder form, messages will appear here.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-coral/10 text-brand-coral font-bold flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{msg.senderName}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Regarding pet <strong className="text-slate-800">{msg.pet?.name}</strong> • {formatDate(msg.createdAt, 'dd MMM yyyy, hh:mm a')}
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

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">&quot;{msg.message}&quot;</p>

                {msg.finderLocation && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-2 border-t border-slate-200/60">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Finder Location: <strong className="text-slate-900">{msg.finderLocation}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
