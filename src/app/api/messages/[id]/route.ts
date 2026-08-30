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
    const message = await db.finderMessage.update({
      where: { id: params.id },
      data: {
        isRead: data.isRead !== undefined ? Boolean(data.isRead) : true,
      },
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Update finder message error:', err);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.finderMessage.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete finder message error:', err);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
