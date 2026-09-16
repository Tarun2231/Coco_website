import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { syncFromCloudStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let pets: any[] = [];
  try {
    const cloudData = await syncFromCloudStore();
    pets = cloudData.pets || [];
  } catch (err) {
    console.error('Dashboard Cloud fetch error:', err);
  }

  return <DashboardClient initialPets={JSON.parse(JSON.stringify(pets))} userName={user.name} />;
}
