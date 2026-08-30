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

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
  });

  if (!pet) return <div className="p-8 text-center text-slate-500">No pets found. Please add a pet from dashboard first.</div>;

  return (
    <VaccinationsClient
      initialVaccinations={(pet.vaccinations as any) || []}
      petId={pet.id}
      petName={pet.name}
    />
  );
}
