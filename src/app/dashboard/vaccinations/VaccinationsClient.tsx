'use client';

import React, { useState } from 'react';
import { CheckCircle2, Plus, Edit2, Trash2, Syringe, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Vaccination } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface VaccinationsClientProps {
  initialVaccinations: Vaccination[];
  petId: string;
  petName: string;
}

export const VaccinationsClient: React.FC<VaccinationsClientProps> = ({
  initialVaccinations,
  petId,
  petName,
}) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialVaccinations);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVac, setEditingVac] = useState<Vaccination | null>(null);
  const [deletingVac, setDeletingVac] = useState<Vaccination | null>(null);

  // Form State
  const [vaccineName, setVaccineName] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinic, setClinic] = useState('');
  const [status, setStatus] = useState<'COMPLETED' | 'UPCOMING' | 'OVERDUE'>('COMPLETED');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVaccinations = async () => {
    try {
      const res = await fetch(`/api/vaccinations?petId=${petId}`);
      const data = await res.json();
      if (data.vaccinations) {
        setVaccinations(data.vaccinations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setVaccineName('');
    setDateAdministered(new Date().toISOString().split('T')[0]);
    setNextDueDate('');
    setVetName('Dr. Rahul Verma');
    setClinic('Banjara Pet Hospital');
    setStatus('COMPLETED');
    setNotes('');
    setError('');
    setIsAddOpen(true);
  };

  const openEditModal = (vac: Vaccination) => {
    setEditingVac(vac);
    setVaccineName(vac.vaccineName);
    setDateAdministered(vac.dateAdministered ? new Date(vac.dateAdministered).toISOString().split('T')[0] : '');
    setNextDueDate(vac.nextDueDate ? new Date(vac.nextDueDate).toISOString().split('T')[0] : '');
    setVetName(vac.vetName || '');
    setClinic(vac.clinic || '');
    setStatus((vac.status as any) || 'COMPLETED');
    setNotes(vac.notes || '');
    setError('');
  };

  const handleSaveVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName || !dateAdministered) {
      setError('Vaccine Name and Date Administered are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEditing = Boolean(editingVac);
      const url = isEditing ? `/api/vaccinations/${editingVac!.id}` : '/api/vaccinations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          vaccineName,
          dateAdministered,
          nextDueDate: nextDueDate || null,
          vetName,
          clinic,
          status,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save vaccination');
      }

      await fetchVaccinations();
      setIsAddOpen(false);
      setEditingVac(null);
    } catch (err: any) {
      setError(err.message || 'Error saving vaccination');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaccination = async () => {
    if (!deletingVac) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vaccinations/${deletingVac.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchVaccinations();
      setDeletingVac(null);
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
          <h1 className="text-2xl font-extrabold text-slate-900">Vaccination Records</h1>
          <p className="text-sm text-slate-500 font-medium">Manage {petName}&apos;s medical immunization history & boosters</p>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          size="sm"
          className="font-bold shadow-md shadow-brand-coral/20 shrink-0"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Vaccination
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {vaccinations.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Syringe className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No vaccination records yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your puppy&apos;s first vaccination certificate or upcoming booster reminder.
            </p>
            <Button onClick={openAddModal} variant="outline" size="sm" className="font-bold" icon={<Plus className="w-4 h-4" />}>
              Add First Vaccination
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Vaccine Name</th>
                  <th className="py-3 px-4">Date Administered</th>
                  <th className="py-3 px-4">Next Due Date</th>
                  <th className="py-3 px-4">Veterinarian & Clinic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {vaccinations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          vac.status === 'COMPLETED'
                            ? 'text-emerald-500'
                            : vac.status === 'UPCOMING'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      />
                      <div>
                        <span>{vac.vaccineName}</span>
                        {vac.notes && <div className="text-[10px] text-slate-400 font-normal">{vac.notes}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{formatDate(vac.dateAdministered)}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {vac.nextDueDate ? formatDate(vac.nextDueDate) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      <div>{vac.vetName || 'Dr. Rahul Verma'}</div>
                      <div className="text-[10px] text-slate-400">{vac.clinic || 'Banjara Pet Hospital'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                          vac.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vac.status === 'UPCOMING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {vac.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(vac)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Vaccination"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingVac(vac)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Vaccination"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen || Boolean(editingVac)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingVac(null);
        }}
        title={editingVac ? 'Edit Vaccination Record' : 'Add Vaccination Record'}
      >
        <form onSubmit={handleSaveVaccination} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Vaccine Name *</label>
            <input
              type="text"
              required
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. DHPP / Rabies Booster"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date Administered *</label>
              <input
                type="date"
                required
                value={dateAdministered}
                onChange={(e) => setDateAdministered(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Next Due Date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Veterinarian Name</label>
              <input
                type="text"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                placeholder="e.g. Dr. Rahul Verma"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                placeholder="e.g. Banjara Pet Hospital"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="Dosage details, booster recommendations..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingVac(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="font-bold">
              {loading ? 'Saving...' : editingVac ? 'Save Changes' : 'Add Vaccination'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingVac)}
        onClose={() => setDeletingVac(null)}
        title="Confirm Delete Vaccination"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 font-medium leading-relaxed">
            Are you sure you want to delete the vaccination record for{' '}
            <strong className="text-slate-900 font-bold">{deletingVac?.vaccineName}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingVac(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteVaccination}
              disabled={loading}
              className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Deleting...' : 'Delete Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
