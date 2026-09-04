import { NextResponse } from 'next/server';
import { getPetById, addReminderToStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const pet = getPetById(petId);
  return NextResponse.json({ reminders: pet?.reminders || [] });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.petId || !data.title) {
      return NextResponse.json({ error: 'petId and title required' }, { status: 400 });
    }

    const reminder = await addReminderToStore(data.petId, data);
    return NextResponse.json({ success: true, reminder });
  } catch (err) {
    console.error('Reminder create error:', err);
    return NextResponse.json({ error: 'Failed to create reminder record' }, { status: 500 });
  }
}
