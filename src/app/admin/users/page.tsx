import React from 'react';
import { db } from '@/lib/db';
import { AdminUsersClient, AdminUserItem } from './AdminUsersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: { _count: { select: { pets: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers: AdminUserItem[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    _count: u._count,
  }));

  return <AdminUsersClient initialUsers={formattedUsers} />;
}
