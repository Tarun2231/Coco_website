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
    const vaccination = await db.vaccination.update({
      where: { id: params.id },
      data: {
        vaccineName: data.vaccineName,
        dateAdministered: data.dateAdministered ? new Date(data.dateAdministered) : undefined,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        vetName: data.vetName,
        clinic: data.clinic,
        batchNo: data.batchNo,
        notes: data.notes,
        status: data.status || 'COMPLETED',
      },
    });

    return NextResponse.json({ vaccination });
  } catch (err) {
    console.error('Update vaccination error:', err);
    return NextResponse.json({ error: 'Failed to update vaccination' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.vaccination.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete vaccination error:', err);
    return NextResponse.json({ error: 'Failed to delete vaccination' }, { status: 500 });
  }
}
