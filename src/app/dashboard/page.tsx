import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoPet = {
  id: 'bruno-demo-id',
  publicId: 'bruno',
  name: 'Bruno',
  species: 'Dog',
  breed: 'Golden Retriever',
  gender: 'Male',
  dob: '2025-05-15',
  color: 'Golden',
  weight: '28 kg',
  microchipId: '988 000 123 456 789',
  registrationNo: 'PET-HYD-2025-0891',
  licenseNo: 'LIC-99210-A',
  photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
  isLost: true,
  lostNotes: 'Bruno got loose near Banjara Hills Park around 4 PM. He is very friendly, wearing a brown leather collar with a Puppy ID QR tag.',
  lastSeenDate: '2026-08-24',
  lastSeenTime: '04:00 PM',
  lastSeenLocation: 'Road No. 5, Banjara Hills, Hyderabad',
  lastSeenLat: 17.4156,
  lastSeenLng: 78.4484,
  rewardAmount: '₹5,000 Cash Reward',
  importantNotes: 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.',
  privacySetting: {
    showName: true,
    showPhoto: true,
    showBreed: true,
    showGender: true,
    showAge: true,
    showColor: true,
    showWeight: true,
    showMicrochip: true,
    showPhone: true,
    showAltPhone: true,
    showEmail: true,
    showAddress: true,
    showVaccinations: true,
    showNotes: true,
    showLastSeen: true,
  },
  vaccinations: [
    { id: '1', vaccineName: 'DHPP', dateAdministered: '2026-03-12', status: 'COMPLETED' },
    { id: '2', vaccineName: 'Rabies', dateAdministered: '2026-03-12', status: 'COMPLETED' },
    { id: '3', vaccineName: 'Booster', dateAdministered: '2026-04-10', status: 'UPCOMING' },
    { id: '4', vaccineName: 'Kennel Cough', dateAdministered: '2026-04-10', status: 'COMPLETED' },
  ],
  expenses: [
    { id: '1', category: 'Food', description: 'Dog Food (Royal Canin)', amount: 2450, currency: '₹', date: '2026-04-12' },
    { id: '2', category: 'Vet', description: 'Vet Visit', amount: 1200, currency: '₹', date: '2026-04-08' },
    { id: '3', category: 'Medicine', description: 'Vitamins & Supplements', amount: 850, currency: '₹', date: '2026-04-05' },
    { id: '4', category: 'Vaccination', description: 'Annual Vaccination Drive', amount: 3500, currency: '₹', date: '2026-03-12' },
    { id: '5', category: 'Accessories', description: 'Puppy ID Engraved Collar & Tag', amount: 1450, currency: '₹', date: '2026-02-20' },
    { id: '6', category: 'Grooming', description: 'Full Spa Grooming', amount: 3000, currency: '₹', date: '2026-01-15' },
  ],
  reminders: [
    { id: '1', category: 'Vaccination', title: 'Booster Vaccination', date: '2026-08-29', repeat: 'ONCE', isCompleted: false },
    { id: '2', category: 'Deworming', title: 'Deworming Tablet', date: '2026-09-08', repeat: 'EVERY_3_MONTHS', isCompleted: false },
    { id: '3', category: 'Flea Treatment', title: 'Flea & Tick Treatment', date: '2026-09-20', repeat: 'MONTHLY', isCompleted: false },
  ],
  qrCode: {
    scanCount: 27,
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pets: any[] = [];
  try {
    pets = await db.pet.findMany({
      where: { userId: user.id },
      include: {
        privacySetting: true,
        vaccinations: true,
        expenses: true,
        reminders: true,
        documents: true,
        qrCode: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  } catch (err) {
    console.error('Dashboard DB fetch error:', err);
  }

  // Only load demo pets for explicit demo account owner@puppyid.com!
  if ((!pets || pets.length === 0) && isDemoAccount) {
    pets = [fallbackBrunoPet as any];
  }

  return <DashboardClient initialPets={pets as any} userName={user.name} />;
}
