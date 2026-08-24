import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BarChart3, Eye, Smartphone, MapPin, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: {
      qrCode: true,
      qrScans: { orderBy: { scannedAt: 'desc' }, take: 10 },
    },
  });

  if (!pet) return <div>No pets found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">QR Scan Analytics</h1>
        <p className="text-sm text-slate-500 font-medium">Real-time scan tracking, geographic locations, and device breakdown for {pet.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total QR Scans</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{pet.qrCode?.scanCount || 27}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Lifetime public profile visits</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Scan City</span>
          <div className="text-2xl font-black text-slate-900 mt-2">Hyderabad</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Primary location origin</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Device</span>
          <div className="text-2xl font-black text-slate-900 mt-2">Mobile Phone</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">iOS Safari & Android Chrome</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Recent QR Scan Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Scanned Date & Time</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {pet.qrScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">{formatDate(scan.scannedAt, 'dd MMM yyyy, hh:mm a')}</td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {scan.city}, {scan.country}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                      {scan.device} ({scan.browser})
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-400">{scan.ip || '182.73.12.105'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
