import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let pets: any[] = [];
  try {
    if (user.id && user.id.length === 24) {
      pets = await db.pet.findMany({
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
    } else if (user.email) {
      pets = await db.pet.findMany({
        where: { user: { email: user.email } },
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
    }
  } catch (err) {
    console.error('Dashboard DB fetch error:', err);
  }

  return <DashboardClient initialPets={pets as any} userName={user.name} />;
}
