import React from 'react';
import { db } from '@/lib/db';
import { Users, Dog, AlertTriangle, QrCode, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const totalUsers = await db.user.count();
  const totalPets = await db.pet.count();
  const lostPets = await db.pet.count({ where: { isLost: true } });
  const totalScans = await db.qRScan.count();

  const recentUsers = await db.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { pets: true } } },
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Admin Overview</h1>
        <p className="text-sm text-slate-400 font-medium">Global SaaS metrics, active user accounts, and lost pet alerts</p>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalUsers}</div>
          <p className="text-xs text-slate-500">Registered pet owners</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Pets</span>
            <Dog className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalPets}</div>
          <p className="text-xs text-slate-500">Active digital pet profiles</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Lost Pets</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-400">{lostPets}</div>
          <p className="text-xs text-slate-500">Emergency reports active</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total QR Scans</span>
            <QrCode className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalScans}</div>
          <p className="text-xs text-slate-500">Public profile scans tracked</p>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Recently Registered Owners</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Pets Registered</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-4 px-4 font-medium text-slate-400">{u.email}</td>
                  <td className="py-4 px-4 font-mono">{u.phone || '+91 98765 43210'}</td>
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
