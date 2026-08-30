import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getActivePetForUser } from '@/lib/getPet';
import { redirect } from 'next/navigation';
import { RemindersClient } from './RemindersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet: any = await getActivePetForUser(user.id, user.email, {
    reminders: { orderBy: { date: 'asc' } },
  });

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  let activePet = pet;
  if (!activePet && isDemoAccount) {
    activePet = {
      id: 'bruno-demo-id',
      name: 'Bruno',
      reminders: [
        { id: '1', category: 'Vaccination', title: 'Booster Vaccination', date: '2026-08-29', time: '10:00 AM', repeat: 'ONCE', notes: 'Visit Dr. Anita Rao', isCompleted: false },
        { id: '2', category: 'Deworming', title: 'Deworming Tablet', date: '2026-09-08', time: '08:30 AM', repeat: 'EVERY_3_MONTHS', notes: 'Give Drontal Plus tablet', isCompleted: false },
        { id: '3', category: 'Flea Treatment', title: 'Flea & Tick Treatment', date: '2026-09-20', time: '07:00 PM', repeat: 'MONTHLY', notes: 'Apply Bravecto spot-on', isCompleted: false },
      ],
    };
  }

  return (
    <RemindersClient
      initialReminders={(activePet?.reminders as any) || []}
      petId={activePet?.id || 'demo-id'}
      petName={activePet?.name || 'Your Pet'}
    />
  );
}
