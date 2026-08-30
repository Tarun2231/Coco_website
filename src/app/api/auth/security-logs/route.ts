import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let loginLogs: any[] = [];
  let auditLogs: any[] = [];

  try {
    const userCondition: any[] = [{ userId: user.id }];
    if (user.email) {
      userCondition.push({ userEmail: user.email.toLowerCase().trim() });
    }

    loginLogs = await db.loginLog.findMany({
      where: {
        OR: userCondition,
      },
      orderBy: { loginTime: 'desc' },
      take: 20,
    });

    auditLogs = await db.auditLog.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (err) {
    console.error('Fetch security logs error:', err);
  }

  return NextResponse.json({
    loginLogs,
    auditLogs,
  });
}
