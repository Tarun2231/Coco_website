import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PublicPetView } from './PublicPetView';

export const revalidate = 0;

export default async function PublicPetPage({ params }: { params: { id: string } }) {
  const petIdentifier = params.id;

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

  if (!pet) {
    notFound();
  }

  // Increment scan metric silently
  try {
    await db.qRCode.updateMany({
      where: { petId: pet.id },
      data: { scanCount: { increment: 1 } },
    });
    await db.qRScan.create({
      data: {
        petId: pet.id,
        device: 'Mobile Browser',
        browser: 'Mobile Safari/Chrome',
        city: 'Hyderabad',
        country: 'India',
      },
    });
  } catch (err) {
    // Ignore metric failure
  }

  return <PublicPetView pet={pet} />;
}
