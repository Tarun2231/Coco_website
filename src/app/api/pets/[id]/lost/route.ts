import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isLost, lastSeenLocation, lastSeenDate, lastSeenTime, rewardAmount, lostNotes } = await req.json();

    const pet = await db.pet.update({
      where: { id: params.id },
      data: {
        isLost,
        lastSeenLocation,
        lastSeenDate: lastSeenDate ? new Date(lastSeenDate) : null,
        lastSeenTime,
        rewardAmount,
        lostNotes,
      },
    });

    return NextResponse.json({ pet });
  } catch (err) {
    console.error('Lost mode toggle error:', err);
    return NextResponse.json({ error: 'Failed to update lost mode' }, { status: 500 });
  }
}
