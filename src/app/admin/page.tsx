import React from 'react';
import { getAllPets } from '@/lib/store';
import { AdminPetsClient } from './pets/AdminPetsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const pets = getAllPets();
  return <AdminPetsClient initialPets={JSON.parse(JSON.stringify(pets))} />;
}
