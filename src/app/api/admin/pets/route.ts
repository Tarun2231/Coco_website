import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
