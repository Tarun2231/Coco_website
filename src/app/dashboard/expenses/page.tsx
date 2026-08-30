import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ExpensesClient } from './ExpensesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { expenses: { orderBy: { date: 'desc' } } },
    });
  } catch (err) {
    console.error('Expenses DB query error:', err);
  }

  // Fallback demo pet if DB is empty or demo account
  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  if (!pet && isDemoAccount) {
    pet = {
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
      initialExpenses={(pet?.expenses as any) || []}
      petId={pet?.id || 'demo-id'}
      petName={pet?.name || 'Your Pet'}
    />
  );
}
