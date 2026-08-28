import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminPetsClient } from './AdminPetsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackPets = [
  {
    id: 'bruno-demo-id',
    publicId: 'bruno',
    name: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
    isLost: true,
    microchipId: '988 000 123 456 789',
    qrCode: { scanCount: 27 },
  },
  {
    id: 'coco-demo-id',
    publicId: 'coco',
    name: 'Coco',
    species: 'Dog',
    breed: 'Poodle',
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop',
    isLost: false,
    microchipId: '988 000 987 654 321',
    qrCode: { scanCount: 14 },
  },
  {
    id: 'max-demo-id',
    publicId: 'max',
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=600&fit=crop',
    isLost: false,
    microchipId: '988 000 555 444 333',
    qrCode: { scanCount: 9 },
  },
];

export default async function AdminPetsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  let pets: any[] = [];
  try {
    pets = await db.pet.findMany({
      include: {
        user: { select: { name: true, email: true } },
        qrCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Admin pets fetch error, using fallback pets:', err);
  }

  if (!pets || pets.length === 0) {
    pets = fallbackPets as any;
  }

  return <AdminPetsClient initialPets={JSON.parse(JSON.stringify(pets))} />;
}
