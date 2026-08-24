'use client';

import React from 'react';
import { DollarSign, Tag, Calendar, CreditCard, ShoppingBag, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Expense } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface ExpensesClientProps {
  expenses: Expense[];
  petName: string;
}

export const ExpensesClient: React.FC<ExpensesClientProps> = ({ expenses, petName }) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by category for PieChart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const COLORS = ['#EF5DA8', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Expense Tracker</h1>
          <p className="text-sm text-slate-500 font-medium">Track food, vet visits, medicines & accessories for {petName}</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Lifetime total pet care expenses</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expense Items</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{expenses.length}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Recorded receipts</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Spending Category</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {pieData.length > 0 ? pieData.sort((a, b) => b.value - a.value)[0].name : 'Food'}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Primary cost driver</p>
        </div>
      </div>

      {/* Charts Row */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Expense Distribution by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
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
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}: {formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Category Comparison Bar</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                    <Bar dataKey="value" fill="#EF5DA8" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Recent Expense Receipts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vendor & Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-extrabold text-slate-900">{exp.description}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600">{formatDate(exp.date)}</td>
                  <td className="py-4 px-4 font-medium text-slate-500">
                    <div>{exp.vendor || 'Local Retailer'}</div>
                    <div className="text-[10px] text-slate-400">{exp.paymentMethod || 'UPI'}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    {formatCurrency(exp.amount, exp.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
