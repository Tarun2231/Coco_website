import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const reminders = await db.reminder.findMany({
    where: { petId },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({ reminders });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const reminder = await db.reminder.create({
      data: {
        petId: data.petId,
        title: data.title,
        category: data.category,
        date: new Date(data.date),
        time: data.time || '09:00 AM',
        repeat: data.repeat || 'ONCE',
        notes: data.notes,
        isCompleted: false,
      },
    });

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error('Reminder create error:', err);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
