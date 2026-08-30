import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AnalyticsClient } from './AnalyticsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: {
      expenses: { orderBy: { date: 'desc' } },
      vaccinations: { orderBy: { dateAdministered: 'desc' } },
      reminders: { orderBy: { date: 'asc' } },
      qrCode: true,
      qrScans: { orderBy: { scannedAt: 'desc' }, take: 15 },
    },
  });

  if (!pet) return <div className="p-8 text-center text-slate-500">No pets found. Please add a pet from dashboard first.</div>;

  return <AnalyticsClient pet={pet as any} />;
}
