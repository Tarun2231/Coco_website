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
    const expense = await db.expense.update({
      where: { id: params.id },
      data: {
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency || '₹',
        date: data.date ? new Date(data.date) : undefined,
        vendor: data.vendor,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });

    return NextResponse.json({ expense });
  } catch (err) {
    console.error('Update expense error:', err);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.expense.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
