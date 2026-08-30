import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getActivePetForUser } from '@/lib/getPet';
import { redirect } from 'next/navigation';
import { VaccinationsClient } from './VaccinationsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet: any = await getActivePetForUser(user.id, {
    vaccinations: { orderBy: { dateAdministered: 'desc' } },
  });

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  let activePet = pet;
  if (!activePet && isDemoAccount) {
    activePet = {
      id: 'bruno-demo-id',
      name: 'Bruno',
      vaccinations: [
        { id: '1', vaccineName: 'DHPP', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Pet Hospital', status: 'COMPLETED' },
        { id: '2', vaccineName: 'Rabies', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Pet Hospital', status: 'COMPLETED' },
        { id: '3', vaccineName: 'Booster Vaccination', dateAdministered: '2026-04-10', nextDueDate: '2026-08-29', vetName: 'Dr. Anita Rao', clinic: 'Pets Care Clinic', status: 'UPCOMING' },
        { id: '4', vaccineName: 'Kennel Cough', dateAdministered: '2026-04-10', nextDueDate: '2027-04-10', vetName: 'Dr. Anita Rao', clinic: 'Pets Care Clinic', status: 'COMPLETED' },
      ],
    };
  }

  return (
    <VaccinationsClient
      initialVaccinations={(activePet?.vaccinations as any) || []}
      petId={activePet?.id || 'demo-id'}
      petName={activePet?.name || 'Your Pet'}
    />
  );
}
