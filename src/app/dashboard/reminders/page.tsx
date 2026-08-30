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

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { reminders: { orderBy: { date: 'asc' } } },
  });

  if (!pet) return <div className="p-8 text-center text-slate-500">No pets found. Please add a pet from dashboard first.</div>;

  return (
    <RemindersClient
      initialReminders={(pet.reminders as any) || []}
      petId={pet.id}
      petName={pet.name}
    />
  );
}
