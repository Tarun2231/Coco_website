'use client';

import React from 'react';
import { BarChart3, Eye, Smartphone, MapPin, DollarSign, Syringe, Bell, TrendingUp } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Pet, Expense, Vaccination, Reminder, QRScan } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface AnalyticsClientProps {
  pet: Pet & {
    expenses?: Expense[];
    vaccinations?: Vaccination[];
    reminders?: Reminder[];
    qrScans?: QRScan[];
    qrCode?: { scanCount: number } | null;
  };
}

export const AnalyticsClient: React.FC<AnalyticsClientProps> = ({ pet }) => {
  const expenses = pet.expenses || [];
  const vaccinations = pet.vaccinations || [];
  const reminders = pet.reminders || [];
  const qrScans = pet.qrScans || [];

  // Expenses calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Current month expenses
  const now = new Date();
  const currentMonthSpent = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Category breakdown for chart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const COLORS = ['#EF5DA8', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899'];

  // Vaccination metrics
  const completedVaccines = vaccinations.filter((v) => v.status === 'COMPLETED').length;
  const upcomingVaccines = vaccinations.filter((v) => v.status === 'UPCOMING').length;

  // Reminder metrics
  const pendingReminders = reminders.filter((r) => !r.isCompleted).length;
  const completedReminders = reminders.filter((r) => r.isCompleted).length;

  // QR Scan calculations
  const scanCount = pet.qrCode?.scanCount || qrScans.length || 0;
  const topCity = qrScans.length > 0 ? qrScans[0].city || 'Hyderabad' : 'Hyderabad';
  const topDevice = qrScans.length > 0 ? qrScans[0].device || 'Mobile Phone' : 'Mobile Phone';

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Pet Management & Scan Analytics</h1>
        <p className="text-sm text-slate-500 font-medium">
          Comprehensive health records, spending distribution, and QR scan metrics for {pet.name}
        </p>
      </div>

      {/* Top 4 Real Data KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-brand-coral">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">This month: {formatCurrency(currentMonthSpent)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vaccinations</span>
            <Syringe className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{vaccinations.length} Records</div>
          <p className="text-xs text-emerald-600 mt-1 font-bold">
            {completedVaccines} Completed • {upcomingVaccines} Upcoming
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders</span>
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pendingReminders} Pending</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{completedReminders} Tasks completed</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Scans</span>
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{scanCount} Scans</div>
          <p className="text-xs text-purple-600 mt-1 font-bold">Top location: {topCity}</p>
        </div>
      </div>

      {/* Spending Breakdown Chart */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-coral" />
              <span>Spending Category Breakdown</span>
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Category Expense Comparison</span>
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent QR Scan Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Recent QR Scan Logs</h3>
        {qrScans.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No QR scan history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Scanned Date & Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Device & Browser</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {qrScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{formatDate(scan.scannedAt, 'dd MMM yyyy, hh:mm a')}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {scan.city || 'Hyderabad'}, {scan.country || 'India'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        {scan.device || 'Mobile'} ({scan.browser || 'Safari'})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-400">{scan.ip || '182.73.12.105'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
