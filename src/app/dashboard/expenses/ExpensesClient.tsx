'use client';

import React, { useState } from 'react';
import { DollarSign, Tag, Calendar, CreditCard, ShoppingBag, Plus, PieChart as PieChartIcon, Hash, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Expense } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/Button';

interface ExpensesClientProps {
  initialExpenses: Expense[];
  petId: string;
  petName: string;
}

export const ExpensesClient: React.FC<ExpensesClientProps> = ({ initialExpenses, petId, petName }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Quick Count Modifier state
  const [isQuickCountOpen, setIsQuickCountOpen] = useState(false);
  const [quickCountInput, setQuickCountInput] = useState('');
  const [quickAmountInput, setQuickAmountInput] = useState('');

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Group by category for Recharts
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount || 0);
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const COLORS = ['#EF5DA8', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#6366F1'];

  const syncExpensesToStorage = (updatedExps: Expense[]) => {
    setExpenses(updatedExps);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updatedPets = parsed.map((p: any) => {
              if (p.id === petId || p.publicId === petId) {
                return { ...p, expenses: updatedExps };
              }
              return p;
            });
            localStorage.setItem('puppy_id_pets', JSON.stringify(updatedPets));
            window.dispatchEvent(new Event('puppy_id_pets_updated'));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  React.useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/pets', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pets) && data.pets.length > 0) {
            const currentPet = data.pets.find((p: any) => p.id === petId || p.publicId === petId) || data.pets[0];
            if (currentPet && currentPet.expenses) {
              setExpenses(currentPet.expenses);
            }
          }
        }
      } catch (e) {
        console.error('Fetch expenses error:', e);
      }
    };
    fetchLatest();

    const handleUpdate = () => fetchLatest();
    window.addEventListener('puppy_id_pets_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('puppy_id_pets_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [petId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    const countNum = parseInt(itemCount) || 1;
    const finalDesc = countNum > 1 ? `${description} (Qty / Count: ${countNum})` : description;
    const parsedAmount = parseFloat(amount) * countNum;

    const newExpItem: Expense = {
      id: `exp-${Date.now()}`,
      petId,
      category,
      description: finalDesc,
      amount: parsedAmount,
      currency: '₹',
      date,
      vendor: vendor || 'Local Pet Store',
      paymentMethod: 'UPI',
    };

    const updatedExps = [newExpItem, ...expenses];
    syncExpensesToStorage(updatedExps);

    setNotice(`✅ Expense Record (Count: ${countNum}) saved for ${petName}!`);
    setTimeout(() => setNotice(null), 4000);

    setDescription('');
    setAmount('');
    setItemCount('1');
    setVendor('');
    setIsSubmitting(false);

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpItem),
      });
    } catch (err) {
      console.error('Save expense API error:', err);
    }
  };

  const handleQuickAddCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const countToAdd = parseInt(quickCountInput) || 1;
    const amountVal = parseFloat(quickAmountInput) || 500;
    if (countToAdd <= 0) return;

    const newItems: Expense[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= countToAdd; i++) {
      newItems.push({
        id: `exp-quick-${Date.now()}-${i}`,
        petId,
        category: 'Care',
        description: `Pet Care Receipt #${expenses.length + i}`,
        amount: amountVal,
        currency: '₹',
        date: todayStr,
        vendor: 'Pet Superstore',
        paymentMethod: 'UPI',
      });
    }

    const updatedExps = [...newItems, ...expenses];
    syncExpensesToStorage(updatedExps);

    setNotice(`✅ Added ${countToAdd} expense record(s) totaling ${formatCurrency(amountVal * countToAdd)} for ${petName}!`);
    setTimeout(() => setNotice(null), 4000);
    setIsQuickCountOpen(false);
    setQuickCountInput('');
    setQuickAmountInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Expense Tracker & Item Count</h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor food, vet visits, medicines & accessories count for <strong className="text-slate-800">{petName}</strong>
          </p>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Summary KPIs & Add Expense Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Summary KPIs WITH QUICK ADD EXPENSE COUNT */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Spent</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalSpent)}</div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Lifetime care expenses</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Receipts</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{expenses.length}</div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Recorded receipt counts</p>
              </div>
            </div>

            {/* QUICK ADD EXPENSE COUNT BUTTON */}
            <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
              <button
                type="button"
                onClick={() => setIsQuickCountOpen(!isQuickCountOpen)}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 font-extrabold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>➕ Quick Add / Set Expense Count</span>
              </button>

              {isQuickCountOpen && (
                <form onSubmit={handleQuickAddCountSubmit} className="pt-3 space-y-2 animate-fadeIn">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    Add Expense Count & Amount for {petName}:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={quickCountInput}
                      onChange={(e) => setQuickCountInput(e.target.value)}
                      placeholder="Count (e.g. 2)"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <input
                      type="number"
                      required
                      value={quickAmountInput}
                      onChange={(e) => setQuickAmountInput(e.target.value)}
                      placeholder="Amount ₹ (e.g. 500)"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
                  >
                    Add Expense Count
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Add Expense Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-coral/10 text-brand-coral flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span>Add New Expense Record</span>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-coral bg-white"
                >
                  <option value="Food">Food & Treats</option>
                  <option value="Vet">Vet Consultation</option>
                  <option value="Vaccination">Vaccination Drive</option>
                  <option value="Medicine">Medicine & Deworming</option>
                  <option value="Accessories">Accessories & Collar Tag</option>
                  <option value="Grooming">Spa Grooming</option>
                  <option value="Toys">Toys & Play</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Royal Canin Dog Food 3kg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              {/* AMOUNT & ITEM QUANTITY COUNT FIELDS */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Unit Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="2450"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-brand-coral" />
                    <span>Count Qty</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-brand-coral bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vendor / Store Name</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Pet Care Store"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md shadow-brand-coral/20 mt-2"
                icon={<Plus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving...' : 'Add Expense Record & Count'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Recharts Visual Analytics Chart & Transactions Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Visual Distribution Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-brand-coral" />
              <span>Spending Breakdown by Category</span>
            </h3>

            {pieData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
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
                <div className="flex flex-wrap justify-center gap-3 text-[11px] font-bold text-slate-700 mt-1">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name}: {formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No category expenses logged yet. Add your first expense on the left form!
              </p>
            )}
          </div>

          {/* Expense History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Expense Receipts</h3>
              <span className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total Receipts: {expenses.length}
              </span>
            </div>

            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No expense receipts recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-slate-900">{exp.description}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-500">{formatDate(exp.date)}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {formatCurrency(exp.amount, exp.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
