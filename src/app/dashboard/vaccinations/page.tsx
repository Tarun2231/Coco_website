import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Syringe, CheckCircle2, Calendar, FileText, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function VaccinationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { vaccinations: { orderBy: { dateAdministered: 'desc' } } },
  });

  if (!pet) return <div>No pets found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vaccination Records</h1>
          <p className="text-sm text-slate-500 font-medium">Manage {pet.name}&apos;s medical immunization history & boosters</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
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
              {pet.vaccinations.map((vac) => (
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
      </div>
    </div>
  );
}
