import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const pets = await db.pet.findMany({
    where: { userId: user.id },
    include: {
      privacySetting: true,
      vaccinations: true,
      expenses: true,
      reminders: true,
      documents: true,
      qrCode: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return <DashboardClient initialPets={pets as any} />;
}
