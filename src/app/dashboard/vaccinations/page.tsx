import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { VaccinationsClient } from './VaccinationsClient';
import { syncFromCloudStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { pets } = await syncFromCloudStore();
  const firstPet = pets.length > 0 ? pets[0] : null;

  return (
    <VaccinationsClient
      initialVaccinations={firstPet?.vaccinations || []}
      petId={firstPet?.id || ''}
      petName={firstPet?.name || 'Your Pet'}
    />
  );
}
