import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getActivePetForUser } from '@/lib/getPet';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';

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
  importantNotes: 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.',
};

export default async function PetProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = await getActivePetForUser(user.id, {
    privacySetting: true,
    qrCode: true,
  });

  if (!pet && isDemoAccount) {
    pet = fallbackBrunoPet;
  }

  return (
    <ProfileClient
      initialPet={pet}
      ownerInfo={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        altPhone: user.altPhone,
        address: user.address,
      }}
    />
  );
}
