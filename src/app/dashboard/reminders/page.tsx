import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Bell, Calendar, Repeat, CheckCircle } from 'lucide-react';
import { formatDate, getCountdownString } from '@/lib/utils';

export const revalidate = 0;

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { reminders: { orderBy: { date: 'asc' } } },
  });

  if (!pet) return <div>No pets found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Schedule & Reminders</h1>
          <p className="text-sm text-slate-500 font-medium">Automatic alerts for vaccinations, deworming, flea care, and food orders</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pet.reminders.map((rem) => {
            const countdown = getCountdownString(rem.date);
            return (
              <div
                key={rem.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-4 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {rem.category}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">{rem.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatDate(rem.date)} at {rem.time || '09:00 AM'}
                    </p>
                    {rem.notes && <p className="text-xs text-slate-600 italic font-medium">{rem.notes}</p>}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Repeat: {rem.repeat.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${
                    countdown.isOverdue
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {countdown.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
