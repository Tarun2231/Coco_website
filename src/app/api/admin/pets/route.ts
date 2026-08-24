import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const pets = await db.pet.findMany({
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
      qrCode: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ pets });
}
