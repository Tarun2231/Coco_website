import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const totalUsers = await db.user.count();
  const totalPets = await db.pet.count();
  const lostPets = await db.pet.count({ where: { isLost: true } });
  const totalScans = await db.qRScan.count();
  const totalMessages = await db.finderMessage.count();

  const recentPets = await db.pet.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({
    totalUsers,
    totalPets,
    activePets: totalPets - lostPets,
    lostPets,
    totalScans,
    totalMessages,
    recentPets,
  });
}
