'use client';

import React, { useState } from 'react';
import { DollarSign, Tag, Calendar, CreditCard, ShoppingBag, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Expense } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ExpensesClientProps {
  initialExpenses: Expense[];
  petId: string;
  petName: string;
}

export const ExpensesClient: React.FC<ExpensesClientProps> = ({
  initialExpenses,
  petId,
  petName,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [deletingExp, setDeletingExp] = useState<Expense | null>(null);

  // Form states
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses?petId=${petId}`);
      const data = await res.json();
      if (data.expenses) {
        setExpenses(data.expenses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const COLORS = ['#EF5DA8', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899'];

  const openAddModal = () => {
    setCategory('Food');
    setDescription('');
    setAmount('');
    setCurrency('₹');
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setPaymentMethod('UPI');
    setNotes('');
    setError('');
    setIsAddOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExp(exp);
    setCategory(exp.category);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setCurrency(exp.currency || '₹');
    setDate(exp.date ? new Date(exp.date).toISOString().split('T')[0] : '');
    setVendor(exp.vendor || '');
    setPaymentMethod(exp.paymentMethod || 'UPI');
    setNotes(exp.notes || '');
    setError('');
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) {
      setError('Description, Amount, and Date are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEditing = Boolean(editingExp);
      const url = isEditing ? `/api/expenses/${editingExp!.id}` : '/api/expenses';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          category,
          description,
          amount: parseFloat(amount),
          currency,
          date,
          vendor,
          paymentMethod,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save expense');
      }

      await fetchExpenses();
      setIsAddOpen(false);
      setEditingExp(null);
    } catch (err: any) {
      setError(err.message || 'Error saving expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${deletingExp.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchExpenses();
      setDeletingExp(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Expense Tracker</h1>
          <p className="text-sm text-slate-500 font-medium">Track food, vet visits, medicines & accessories for {petName}</p>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          size="sm"
          className="font-bold shadow-md shadow-brand-coral/20 shrink-0"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Expense
        </Button>
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
            {pieData.length > 0 ? pieData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
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
              <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Category Comparison</h3>
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
        <h3 className="text-base font-extrabold text-slate-900">Expense Receipts & History</h3>
        {expenses.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No expenses recorded yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start tracking food, vet visits, and gear costs for {petName}.
            </p>
            <Button onClick={openAddModal} variant="outline" size="sm" className="font-bold" icon={<Plus className="w-4 h-4" />}>
              Record First Expense
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vendor & Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingExp(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddOpen || Boolean(editingExp)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingExp(null);
        }}
        title={editingExp ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Royal Canin Dog Food / Routine Vet Consultation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              >
                <option value="Food">Food</option>
                <option value="Vet">Vet Visit</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Medicine">Medicine & Supplements</option>
                <option value="Grooming">Grooming</option>
                <option value="Toys">Toys</option>
                <option value="Accessories">Accessories & Collar</option>
                <option value="Training">Training</option>
                <option value="Insurance">Insurance</option>
                <option value="Boarding">Boarding & Care</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                placeholder="2450"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Vendor / Store Name</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. PetSupermarket Hyderabad / Banjara Vet Clinic"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Receipt Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="Receipt details, quantity, warranty info..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingExp(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="font-bold">
              {loading ? 'Saving...' : editingExp ? 'Save Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingExp)}
        onClose={() => setDeletingExp(null)}
        title="Confirm Delete Expense"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 font-medium leading-relaxed">
            Are you sure you want to delete the expense receipt for{' '}
            <strong className="text-slate-900 font-bold">{deletingExp?.description}</strong> ({deletingExp && formatCurrency(deletingExp.amount)})?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingExp(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteExpense}
              disabled={loading}
              className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Deleting...' : 'Delete Expense'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
