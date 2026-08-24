import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ExpensesClient } from './ExpensesClient';

export const revalidate = 0;

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { expenses: { orderBy: { date: 'desc' } } },
  });

  if (!pet) return <div>No pets found.</div>;

  return <ExpensesClient expenses={(pet.expenses as any) || []} petName={pet.name} />;
}
