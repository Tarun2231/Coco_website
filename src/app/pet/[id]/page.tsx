import React from 'react';
import { getPetById } from '@/lib/store';
import { PublicPetView } from './PublicPetView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicPetPage({ params }: { params: { id: string } }) {
  const petIdentifier = params?.id || 'bruno';
  const pet = getPetById(petIdentifier) || getPetById('bruno');

  const serializedPet = JSON.parse(JSON.stringify(pet));
  return <PublicPetView pet={serializedPet} />;
}
