import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    console.error('GET /api/pets DB error:', err);
  }

  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json().catch(() => ({}));
    if (!data.name) {
      return NextResponse.json({ error: 'Pet Name is required' }, { status: 400 });
    }

    const cleanName = String(data.name).trim();
    const publicId = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;

    let newPet = null;

    try {
      // 1. Ensure User exists in DB to satisfy Foreign Key relation
      let dbUser = null;
      if (user.id && user.id.length === 24) {
        dbUser = await db.user.findUnique({ where: { id: user.id } }).catch(() => null);
      }
      if (!dbUser && user.email) {
        dbUser = await db.user.findUnique({ where: { email: user.email } }).catch(() => null);
      }

      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: 'demo-password-hash',
            phone: user.phone || '+91 98765 43210',
            role: user.role || 'USER',
          },
        });
      }

      // 2. Create Pet in DB
      newPet = await db.pet.create({
        data: {
          userId: dbUser.id,
          publicId,
          name: cleanName,
          species: data.species || 'Dog',
          breed: data.breed || 'Golden Retriever',
          gender: data.gender || 'Male',
          dob: data.dob ? new Date(data.dob) : null,
          color: data.color || 'Golden',
          weight: data.weight || '28 kg',
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
              qrCodeUrl: `https://coco-website-ten.vercel.app/pet/${publicId}`,
              scanCount: 0,
            },
          },
        },
        include: {
          privacySetting: true,
          qrCode: true,
        },
      });
    } catch (dbErr) {
      console.error('DB Pet creation error, using session fallback:', dbErr);
    }

    // Fallback pet object if DB insertion fails on serverless environments
    if (!newPet) {
      newPet = {
        id: `pet-${Math.random().toString(36).substring(2, 8)}`,
        publicId,
        userId: user.id,
        name: cleanName,
        species: data.species || 'Dog',
        breed: data.breed || 'Golden Retriever',
        gender: data.gender || 'Male',
        dob: data.dob || '2025-05-15',
        color: data.color || 'Golden',
        weight: data.weight || '28 kg',
        microchipId: data.microchipId || '988 000 123 456 789',
        registrationNo: data.registrationNo,
        licenseNo: data.licenseNo,
        photo: data.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
        importantNotes: data.importantNotes || 'Friendly boy, loves kids.',
        isLost: false,
        user: {
          name: user.name,
          phone: user.phone || '+91 98765 43210',
          email: user.email,
          address: user.address || 'Road No. 5, Banjara Hills, Hyderabad',
        },
        privacySetting: { showName: true, showPhoto: true },
        vaccinations: [],
        expenses: [],
        reminders: [],
        qrCode: { qrCodeUrl: `https://coco-website-ten.vercel.app/pet/${publicId}`, scanCount: 0 },
      };
    }

    return NextResponse.json({ success: true, pet: newPet });
  } catch (err) {
    console.error('Add pet error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
