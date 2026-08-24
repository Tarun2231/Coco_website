import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const setting = await db.privacySetting.findUnique({
    where: { petId },
  });

  return NextResponse.json({ setting });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { petId, settings } = await req.json();

    const updated = await db.privacySetting.upsert({
      where: { petId },
      update: settings,
      create: {
        petId,
        ...settings,
      },
    });

    return NextResponse.json({ setting: updated });
  } catch (err) {
    console.error('Privacy update error:', err);
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}
