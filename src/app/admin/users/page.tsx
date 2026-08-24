import React from 'react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Users, ShieldCheck, UserX } from 'lucide-react';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: { _count: { select: { pets: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">User Account Management</h1>
        <p className="text-sm text-slate-400 font-medium">Manage registered pet owners, permissions, and roles</p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Pets</th>
                <th className="py-3 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-300">{u.email}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.phone || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-amber-500">{u._count.pets} Pet(s)</td>
                  <td className="py-4 px-4 text-right text-slate-400">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
