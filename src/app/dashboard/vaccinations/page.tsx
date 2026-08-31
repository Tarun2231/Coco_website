import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Syringe, CheckCircle2, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoVaccinations = [
  { id: '1', vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus)', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Clinic', status: 'COMPLETED' },
  { id: '2', vaccineName: 'Rabies Anti-Rabies Vaccine', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Clinic', status: 'COMPLETED' },
  { id: '3', vaccineName: 'Annual Booster Shot', dateAdministered: '2026-04-10', nextDueDate: '2026-08-29', vetName: 'Dr. Ananya Rao', clinic: 'Apollo Vet Hospital', status: 'UPCOMING' },
  { id: '4', vaccineName: 'Bordetella Kennel Cough', dateAdministered: '2026-04-10', nextDueDate: '2027-04-10', vetName: 'Dr. Ananya Rao', clinic: 'Apollo Vet Hospital', status: 'COMPLETED' },
];

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  let vaccinations: any[] = [];

  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
    });
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
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vaccination Records</h1>
          <p className="text-sm text-slate-500 font-medium">Manage {pet.name}&apos;s medical immunization history & boosters</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {vaccinations.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">
            No vaccination records logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Vaccine Name</th>
                  <th className="py-3 px-4">Date Administered</th>
                  <th className="py-3 px-4">Next Due Date</th>
                  <th className="py-3 px-4">Veterinarian & Clinic</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {vaccinations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{vac.vaccineName}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{formatDate(vac.dateAdministered)}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {vac.nextDueDate ? formatDate(vac.nextDueDate) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      <div>{vac.vetName || 'Dr. Rahul Verma'}</div>
                      <div className="text-[10px] text-slate-400">{vac.clinic || 'Banjara Pet Hospital'}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                          vac.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vac.status === 'UPCOMING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {vac.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
