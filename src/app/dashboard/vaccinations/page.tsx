import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { VaccinationsClient } from './VaccinationsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
    });
  } catch (err) {
    console.error('Vaccinations DB query error:', err);
  }

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  if (!pet && isDemoAccount) {
    pet = {
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
      initialVaccinations={(pet?.vaccinations as any) || []}
      petId={pet?.id || 'demo-id'}
      petName={pet?.name || 'Your Pet'}
    />
  );
}
