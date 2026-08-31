import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ExpensesClient } from './ExpensesClient';
import { DollarSign, Plus, Dog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoExpenses = [
  { id: '1', petId: 'bruno-demo-id', category: 'Food', description: 'Dog Food (Royal Canin)', amount: 2450, currency: '₹', date: '2026-04-12', vendor: 'Pet Care Store', paymentMethod: 'UPI' },
  { id: '2', petId: 'bruno-demo-id', category: 'Vet', description: 'Vet Consultation & Checkup', amount: 1200, currency: '₹', date: '2026-04-08', vendor: 'Banjara Vet Clinic', paymentMethod: 'Card' },
  { id: '3', petId: 'bruno-demo-id', category: 'Medicine', description: 'Vitamins & Deworming', amount: 850, currency: '₹', date: '2026-04-05', vendor: 'MedPlus Pharmacy', paymentMethod: 'UPI' },
  { id: '4', petId: 'bruno-demo-id', category: 'Vaccination', description: 'Annual Rabies & DHPP Drive', amount: 3500, currency: '₹', date: '2026-03-12', vendor: 'Govt Vet Hospital', paymentMethod: 'UPI' },
  { id: '5', petId: 'bruno-demo-id', category: 'Accessories', description: 'Puppy ID Engraved Collar & Tag', amount: 1450, currency: '₹', date: '2026-02-20', vendor: 'Puppy ID Studio', paymentMethod: 'UPI' },
  { id: '6', petId: 'bruno-demo-id', category: 'Grooming', description: 'Full Spa Grooming & Bath', amount: 3000, currency: '₹', date: '2026-01-15', vendor: 'Paw Spa Banjara', paymentMethod: 'Card' },
];

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  let expenses: any[] = [];

  try {
    if (user.id && user.id.length === 24) {
      pet = await db.pet.findFirst({
        where: { userId: user.id },
        include: { expenses: { orderBy: { date: 'desc' } } },
      });
    } else if (user.email) {
      pet = await db.pet.findFirst({
        where: { user: { email: user.email } },
        include: { expenses: { orderBy: { date: 'desc' } } },
      });
    }
    if (pet?.expenses) {
      expenses = pet.expenses;
    }
  } catch (err) {
    console.error('Expenses page fetch error:', err);
  }

  if (!pet && isDemoAccount) {
    pet = { id: 'bruno-demo-id', name: 'Bruno' };
    expenses = fallbackBrunoExpenses;
  }

  if (!pet) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto my-8 space-y-4 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <DollarSign className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Pet Selected for Expense Tracking</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please add a pet to your account first. Once added, you can log food, vet visits, medicines, and grooming expenses.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="primary" className="font-bold shadow-md px-6" icon={<Plus className="w-4 h-4" />}>
            Go to Dashboard & Add Pet
          </Button>
        </Link>
      </div>
    );
  }

  return <ExpensesClient initialExpenses={JSON.parse(JSON.stringify(expenses))} petId={pet.id} petName={pet.name} />;
}
