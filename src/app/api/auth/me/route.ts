import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.altPhone !== undefined) updateData.altPhone = data.altPhone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    if (data.newPassword) {
      if (data.currentPassword) {
        const currentUserDb = await db.user.findUnique({ where: { id: user.id } });
        if (currentUserDb) {
          const isValid = await bcrypt.compare(data.currentPassword, currentUserDb.password);
          if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
          }
        }
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        altPhone: true,
        address: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Update user profile error:', err);
    return NextResponse.json({ error: 'Failed to update account details' }, { status: 500 });
  }
}
