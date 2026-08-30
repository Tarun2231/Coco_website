import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getActivePetForUser } from '@/lib/getPet';
import { redirect } from 'next/navigation';
import { ExpensesClient } from './ExpensesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet: any = await getActivePetForUser(user.id, user.email, {
    expenses: { orderBy: { date: 'desc' } },
  });

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  let activePet = pet;
  if (!activePet && isDemoAccount) {
    activePet = {
      id: 'bruno-demo-id',
      name: 'Bruno',
      expenses: [
        { id: '1', category: 'Food', description: 'Dog Food (Royal Canin)', amount: 2450, currency: '₹', date: '2026-04-12' },
        { id: '2', category: 'Vet', description: 'Vet Visit', amount: 1200, currency: '₹', date: '2026-04-08' },
        { id: '3', category: 'Medicine', description: 'Vitamins & Supplements', amount: 850, currency: '₹', date: '2026-04-05' },
        { id: '4', category: 'Vaccination', description: 'Annual Vaccination Drive', amount: 3500, currency: '₹', date: '2026-03-12' },
        { id: '5', category: 'Accessories', description: 'Puppy ID Engraved Collar Tag', amount: 1450, currency: '₹', date: '2026-02-20' },
        { id: '6', category: 'Grooming', description: 'Full Spa Grooming', amount: 3000, currency: '₹', date: '2026-01-15' },
      ],
    };
  }

  return (
    <ExpensesClient
      initialExpenses={(activePet?.expenses as any) || []}
      petId={activePet?.id || 'demo-id'}
      petName={activePet?.name || 'Your Pet'}
    />
  );
}
