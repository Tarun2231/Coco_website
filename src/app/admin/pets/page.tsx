import React from 'react';
import { getAllPets } from '@/lib/store';
import { AdminPetsClient } from './AdminPetsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPetsPage() {
  const pets = getAllPets();
  return <AdminPetsClient initialPets={JSON.parse(JSON.stringify(pets))} />;
}
