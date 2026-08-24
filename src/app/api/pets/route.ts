import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pets = await db.pet.findMany({
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

  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const publicId = `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;

    const pet = await db.pet.create({
      data: {
        userId: user.id,
        publicId,
        name: data.name,
        species: data.species || 'Dog',
        breed: data.breed,
        gender: data.gender || 'Male',
        dob: data.dob ? new Date(data.dob) : null,
        color: data.color,
        weight: data.weight,
        microchipId: data.microchipId,
        registrationNo: data.registrationNo,
        licenseNo: data.licenseNo,
        photo: data.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
        importantNotes: data.importantNotes,
        privacySetting: {
          create: {
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
        },
        qrCode: {
          create: {
            qrCodeUrl: `http://localhost:3000/pet/${publicId}`,
            scanCount: 0,
          },
        },
      },
      include: {
        privacySetting: true,
        qrCode: true,
      },
    });

    return NextResponse.json({ pet });
  } catch (err) {
    console.error('Add pet error:', err);
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  }
}
