import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessagesClient } from './MessagesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const messages = await db.finderMessage.findMany({
    where: { pet: { userId: user.id } },
    include: { pet: { select: { name: true, photo: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return <MessagesClient initialMessages={(messages as any) || []} />;
}
