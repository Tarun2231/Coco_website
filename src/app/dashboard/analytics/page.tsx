import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getActivePetForUser } from '@/lib/getPet';
import { redirect } from 'next/navigation';
import { AnalyticsClient } from './AnalyticsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet: any = await getActivePetForUser(user.id, user.email, {
    expenses: { orderBy: { date: 'desc' } },
    vaccinations: { orderBy: { dateAdministered: 'desc' } },
    reminders: { orderBy: { date: 'asc' } },
    qrCode: true,
    qrScans: { orderBy: { scannedAt: 'desc' }, take: 15 },
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
      vaccinations: [
        { id: '1', vaccineName: 'DHPP', status: 'COMPLETED' },
        { id: '2', vaccineName: 'Rabies', status: 'COMPLETED' },
        { id: '3', vaccineName: 'Booster', status: 'UPCOMING' },
      ],
      reminders: [
        { id: '1', title: 'Booster Vaccination', isCompleted: false },
        { id: '2', title: 'Deworming Tablet', isCompleted: false },
      ],
      qrCode: { scanCount: 27 },
      qrScans: [
        { id: 's1', scannedAt: new Date().toISOString(), city: 'Hyderabad', country: 'India', device: 'Mobile', browser: 'Safari', ip: '182.73.12.105' },
      ],
    };
  }

  if (!activePet) {
    activePet = {
      id: 'empty-id',
      name: 'Your Pet',
      expenses: [],
      vaccinations: [],
      reminders: [],
      qrCode: { scanCount: 0 },
      qrScans: [],
    };
  }

  return <AnalyticsClient pet={activePet as any} />;
}
