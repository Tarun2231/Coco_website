import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ExpensesClient } from './ExpensesClient';
import { getAllPets } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pets = getAllPets();
  const firstPet = pets.length > 0 ? pets[0] : null;

  return (
    <ExpensesClient
      initialExpenses={firstPet?.expenses || []}
      petId={firstPet?.id || ''}
      petName={firstPet?.name || 'Your Pet'}
    />
  );
}
