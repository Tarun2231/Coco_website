import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { VaccinationsClient } from './VaccinationsClient';
import { Syringe, Plus, Dog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoVaccinations = [
  { id: '1', petId: 'bruno-demo-id', vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus)', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Clinic', status: 'COMPLETED' },
  { id: '2', petId: 'bruno-demo-id', vaccineName: 'Rabies Anti-Rabies Vaccine', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Clinic', status: 'COMPLETED' },
  { id: '3', petId: 'bruno-demo-id', vaccineName: 'Annual Booster Shot', dateAdministered: '2026-04-10', nextDueDate: '2026-08-29', vetName: 'Dr. Ananya Rao', clinic: 'Apollo Vet Hospital', status: 'UPCOMING' },
  { id: '4', petId: 'bruno-demo-id', vaccineName: 'Bordetella Kennel Cough', dateAdministered: '2026-04-10', nextDueDate: '2027-04-10', vetName: 'Dr. Ananya Rao', clinic: 'Apollo Vet Hospital', status: 'COMPLETED' },
];

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  let vaccinations: any[] = [];

  try {
    if (user.id && user.id.length === 24) {
      pet = await db.pet.findFirst({
        where: { userId: user.id },
        include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
      });
    }
    if (!pet && user.email) {
      pet = await db.pet.findFirst({
        where: { user: { email: user.email } },
        include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
      });
    }
    if (pet?.vaccinations) vaccinations = pet.vaccinations;
  } catch (err) {
    console.error('Vaccinations page fetch error:', err);
  }

  if (!pet && isDemoAccount) {
    pet = { id: 'bruno-demo-id', name: 'Bruno' };
    vaccinations = fallbackBrunoVaccinations;
  }

  if (!pet) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto my-8 space-y-4 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Syringe className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Pet Selected for Vaccinations</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please add a pet to your account first. Once added, you can track rabies, DHPP, and booster immunization records.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="primary" className="font-bold shadow-md px-6" icon={<Plus className="w-4 h-4" />}>
            Go to Dashboard & Add Pet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <VaccinationsClient
      initialVaccinations={JSON.parse(JSON.stringify(vaccinations))}
      petId={pet.id}
      petName={pet.name}
    />
  );
}
