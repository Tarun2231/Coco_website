import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
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
        qrCode: true,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    try {
      await db.qRCode.updateMany({
        where: { petId: pet.id },
        data: { scanCount: { increment: 1 } },
      });

      await db.qRScan.create({
        data: {
          petId: pet.id,
          device: 'Mobile Browser',
          browser: 'Mobile Web',
          city: 'Hyderabad',
          country: 'India',
        },
      });
    } catch (metricErr) {
      // Ignore metric error
    }

    return NextResponse.json({ pet });
  } catch (err) {
    console.error('Fetch pet error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const pet = await db.pet.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ pet });
  } catch (err) {
    console.error('Update pet error:', err);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.pet.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  }
}
