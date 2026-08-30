'use client';

import React, { useState } from 'react';
import { Bell, Calendar, Repeat, CheckCircle, Plus, Edit2, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { formatDate, getCountdownString } from '@/lib/utils';
import { Reminder } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface RemindersClientProps {
  initialReminders: Reminder[];
  petId: string;
  petName: string;
}

export const RemindersClient: React.FC<RemindersClientProps> = ({
  initialReminders,
  petId,
  petName,
}) => {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRem, setEditingRem] = useState<Reminder | null>(null);
  const [deletingRem, setDeletingRem] = useState<Reminder | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vaccination');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM');
  const [repeat, setRepeat] = useState('ONCE');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    try {
      const res = await fetch(`/api/reminders?petId=${petId}`);
      const data = await res.json();
      if (data.reminders) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setTitle('');
    setCategory('Vaccination');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:00 AM');
    setRepeat('ONCE');
    setNotes('');
    setError('');
    setIsAddOpen(true);
  };

  const openEditModal = (rem: Reminder) => {
    setEditingRem(rem);
    setTitle(rem.title);
    setCategory(rem.category);
    setDate(rem.date ? new Date(rem.date).toISOString().split('T')[0] : '');
    setTime(rem.time || '09:00 AM');
    setRepeat(rem.repeat || 'ONCE');
    setNotes(rem.notes || '');
    setError('');
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      setError('Title and Date are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEditing = Boolean(editingRem);
      const url = isEditing ? `/api/reminders/${editingRem!.id}` : '/api/reminders';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          title,
          category,
          date,
          time,
          repeat,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save reminder');
      }

      await fetchReminders();
      setIsAddOpen(false);
      setEditingRem(null);
    } catch (err: any) {
      setError(err.message || 'Error saving reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (rem: Reminder) => {
    try {
      const newStatus = !rem.isCompleted;
      // Optimistic update
      setReminders((prev) =>
        prev.map((r) => (r.id === rem.id ? { ...r, isCompleted: newStatus } : r))
      );

      await fetch(`/api/reminders/${rem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchReminders();
    }
  };

  const handleDeleteReminder = async () => {
    if (!deletingRem) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders/${deletingRem.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
      await fetchReminders();
      setDeletingRem(null);
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
          <h1 className="text-2xl font-extrabold text-slate-900">Pet Schedule & Reminders</h1>
          <p className="text-sm text-slate-500 font-medium">Automatic alerts for vaccinations, deworming, flea care, and food orders for {petName}</p>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          size="sm"
          className="font-bold shadow-md shadow-brand-coral/20 shrink-0"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Reminder
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {reminders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No upcoming reminders</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create reminders for {petName}&apos;s grooming, vet visits, medications, or food refills.
            </p>
            <Button onClick={openAddModal} variant="outline" size="sm" className="font-bold" icon={<Plus className="w-4 h-4" />}>
              Create First Reminder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => {
              const countdown = getCountdownString(rem.date);
              return (
                <div
                  key={rem.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                    rem.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(rem)}
                        className="mt-0.5 text-slate-400 hover:text-brand-coral transition-colors"
                        title={rem.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      >
                        {rem.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 hover:text-brand-coral" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {rem.category}
                        </span>
                        <h4 className={`text-base font-extrabold ${rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {rem.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatDate(rem.date)} at {rem.time || '09:00 AM'}
                        </p>
                        {rem.notes && <p className="text-xs text-slate-600 italic font-medium">{rem.notes}</p>}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Repeat: {rem.repeat.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                        rem.isCompleted
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : countdown.isOverdue
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {rem.isCompleted ? 'Completed' : countdown.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleComplete(rem)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {rem.isCompleted ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => openEditModal(rem)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Reminder"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingRem(rem)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen || Boolean(editingRem)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingRem(null);
        }}
        title={editingRem ? 'Edit Reminder' : 'Create New Reminder'}
      >
        <form onSubmit={handleSaveReminder} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reminder Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Rabies Booster / Deworming Tablet"
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
                <option value="Vaccination">Vaccination</option>
                <option value="Deworming">Deworming</option>
                <option value="Flea Treatment">Flea & Tick Treatment</option>
                <option value="Grooming">Grooming</option>
                <option value="Vet Visit">Vet Visit</option>
                <option value="Medicine">Medication</option>
                <option value="Food">Food Order Refill</option>
                <option value="Custom">Custom Event</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reminder Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                placeholder="09:00 AM"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Repeat Frequency</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              >
                <option value="ONCE">Once Only</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="EVERY_3_MONTHS">Every 3 Months</option>
                <option value="EVERY_6_MONTHS">Every 6 Months</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Give Drontal Plus tablet with breakfast food..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingRem(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="font-bold">
              {loading ? 'Saving...' : editingRem ? 'Save Reminder' : 'Create Reminder'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingRem)}
        onClose={() => setDeletingRem(null)}
        title="Confirm Delete Reminder"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 font-medium leading-relaxed">
            Are you sure you want to delete the reminder for{' '}
            <strong className="text-slate-900 font-bold">{deletingRem?.title}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingRem(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteReminder}
              disabled={loading}
              className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Deleting...' : 'Delete Reminder'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
