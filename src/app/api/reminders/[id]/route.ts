import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const reminder = await db.reminder.update({
      where: { id: params.id },
      data: {
        title: data.title,
        category: data.category,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time,
        repeat: data.repeat || 'ONCE',
        notes: data.notes,
        isCompleted: data.isCompleted !== undefined ? data.isCompleted : undefined,
      },
    });

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error('Update reminder error:', err);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const reminder = await db.reminder.update({
      where: { id: params.id },
      data: {
        isCompleted: Boolean(data.isCompleted),
      },
    });

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error('Toggle reminder completion error:', err);
    return NextResponse.json({ error: 'Failed to update reminder status' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.reminder.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete reminder error:', err);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
