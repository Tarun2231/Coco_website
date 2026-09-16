import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { getAllPets } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const pets = getAllPets();

  return <DashboardClient initialPets={JSON.parse(JSON.stringify(pets))} userName={user.name} />;
}
