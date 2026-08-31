import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Bell, Calendar, Repeat, CheckCircle, Plus } from 'lucide-react';
import { formatDate, getCountdownString } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoReminders = [
  { id: '1', petId: 'bruno-demo-id', category: 'Vaccination', title: 'Booster Vaccination', date: '2026-08-29', time: '10:00 AM', repeat: 'ONCE', notes: 'Visit Dr. Anita Rao at Pets Care Clinic', isCompleted: false },
  { id: '2', petId: 'bruno-demo-id', category: 'Deworming', title: 'Deworming Tablet', date: '2026-09-08', time: '08:30 AM', repeat: 'EVERY_3_MONTHS', notes: 'Give Drontal Plus tablet with breakfast', isCompleted: false },
  { id: '3', petId: 'bruno-demo-id', category: 'Flea Treatment', title: 'Flea & Tick Treatment', date: '2026-09-20', time: '07:00 PM', repeat: 'MONTHLY', notes: 'Apply Bravecto spot-on between shoulder blades', isCompleted: false },
];

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  let reminders: any[] = [];

  try {
    if (user.id && user.id.length === 24) {
      pet = await db.pet.findFirst({
        where: { userId: user.id },
        include: { reminders: { orderBy: { date: 'asc' } } },
      });
    }
    if (!pet && user.email) {
      pet = await db.pet.findFirst({
        where: { user: { email: user.email } },
        include: { reminders: { orderBy: { date: 'asc' } } },
      });
    }
    if (pet?.reminders) reminders = pet.reminders;
  } catch (err) {
    console.error('Reminders page fetch error:', err);
  }

  if (!pet && isDemoAccount) {
    pet = { id: 'bruno-demo-id', name: 'Bruno' };
    reminders = fallbackBrunoReminders;
  }

  if (!pet) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto my-8 space-y-4 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Pet Selected for Reminders</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please add a pet to your account first. Once added, you can manage vaccination, deworming, and care reminders.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="primary" className="font-bold shadow-md px-6" icon={<Plus className="w-4 h-4" />}>
            Go to Dashboard & Add Pet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Schedule & Reminders</h1>
          <p className="text-sm text-slate-500 font-medium">Automatic alerts for vaccinations, deworming & care for {pet.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {reminders.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">
            No reminders scheduled yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => {
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
                        <span>Repeat: {String(rem.repeat || 'ONCE').replace('_', ' ')}</span>
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
        )}
      </div>
    </div>
  );
}
