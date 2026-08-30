import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { RemindersClient } from './RemindersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RemindersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { reminders: { orderBy: { date: 'asc' } } },
    });
  } catch (err) {
    console.error('Reminders DB query error:', err);
  }

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  if (!pet && isDemoAccount) {
    pet = {
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
      initialReminders={(pet?.reminders as any) || []}
      petId={pet?.id || 'demo-id'}
      petName={pet?.name || 'Your Pet'}
    />
  );
}
