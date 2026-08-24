import React from 'react';
import { db } from '@/lib/db';
import { PublicPetView } from './PublicPetView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoPet = {
  id: 'bruno-demo-id',
  publicId: 'bruno',
  name: 'Bruno',
  species: 'Dog',
  breed: 'Golden Retriever',
  gender: 'Male',
  dob: new Date('2025-05-15'),
  color: 'Golden',
  weight: '28 kg',
  microchipId: '988 000 123 456 789',
  registrationNo: 'PET-HYD-2025-0891',
  licenseNo: 'LIC-99210-A',
  photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
  isLost: true,
  lostNotes: 'Bruno got loose near Banjara Hills Park around 4 PM. He is very friendly, wearing a brown leather collar with a Puppy ID QR tag.',
  lastSeenDate: new Date('2026-08-24'),
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
  user: {
    name: 'Demo Owner',
    phone: '+91 98765 43210',
    altPhone: '+91 91234 56789',
    email: 'myfamily@email.com',
    address: '12, Green Meadows Apartment, Road No. 5, Banjara Hills, Hyderabad, Telangana 500034, India',
  },
  vaccinations: [
    { id: '1', vaccineName: 'DHPP', dateAdministered: new Date('2026-03-12'), status: 'COMPLETED' },
    { id: '2', vaccineName: 'Rabies', dateAdministered: new Date('2026-03-12'), status: 'COMPLETED' },
    { id: '3', vaccineName: 'Booster', dateAdministered: new Date('2026-04-10'), status: 'UPCOMING' },
    { id: '4', vaccineName: 'Kennel Cough', dateAdministered: new Date('2026-04-10'), status: 'COMPLETED' },
  ],
};

export default async function PublicPetPage({ params }: { params: { id: string } }) {
  const petIdentifier = params.id;

  try {
    const pet = await db.pet.findFirst({
      where: {
        OR: [{ publicId: petIdentifier }, { id: petIdentifier }],
      },
      include: {
        privacySetting: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            altPhone: true,
            address: true,
          },
        },
        vaccinations: true,
      },
    });

    if (pet) {
      return <PublicPetView pet={pet} />;
    }
  } catch (err) {
    console.error('Database fetch error in /pet/[id], falling back to demo data:', err);
  }

  // Fallback to Bruno demo pet if DB is unseeded or pet not found
  return <PublicPetView pet={fallbackBrunoPet} />;
}
