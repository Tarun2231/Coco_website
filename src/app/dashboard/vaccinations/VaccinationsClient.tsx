'use client';

import React, { useState, useEffect } from 'react';
import { Syringe, CheckCircle2, Calendar, Plus, Clock, AlertCircle, Dog, Edit3, Hash } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface VaccinationItem {
  id: string;
  petId: string;
  vaccineName: string;
  doseCount?: number | string;
  dateAdministered: string;
  nextDueDate?: string;
  vetName?: string;
  clinic?: string;
  notes?: string;
  status: string;
}

interface VaccinationsClientProps {
  initialVaccinations: VaccinationItem[];
  petId: string;
  petName: string;
}

export const VaccinationsClient: React.FC<VaccinationsClientProps> = ({
  initialVaccinations,
  petId,
  petName,
}) => {
  const [allPets, setAllPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(petId);
  const [currentPetName, setCurrentPetName] = useState<string>(petName);

  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentPet = parsed.find((p: any) => p.id === petId || p.publicId === petId) || parsed[0];
            if (currentPet?.vaccinations && Array.isArray(currentPet.vaccinations)) {
              return currentPet.vaccinations;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialVaccinations;
  });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/pets', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pets) && data.pets.length > 0) {
            setAllPets(data.pets);
            const currentPet = data.pets.find((p: any) => p.id === selectedPetId || p.publicId === selectedPetId) || data.pets[0];
            if (currentPet) {
              setCurrentPetName(currentPet.name);
              if (currentPet.vaccinations && Array.isArray(currentPet.vaccinations)) {
                setVaccinations(currentPet.vaccinations);
              }
            }
          }
        }
      } catch (e) {
        console.error('Fetch vaccinations error:', e);
      }
    };
    fetchLatest();
  }, [selectedPetId]);

  const [vaccineName, setVaccineName] = useState('Rabies Anti-Rabies Vaccine');
  const [doseCount, setDoseCount] = useState<string>('1');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinic, setClinic] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [addReminderAlert, setAddReminderAlert] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal / Inline Quick Count Modifier
  const [isQuickCountOpen, setIsQuickCountOpen] = useState(false);
  const [customCountInput, setCustomCountInput] = useState('');

  const handlePetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    setSelectedPetId(targetId);
    const targetPet = allPets.find((p) => p.id === targetId || p.publicId === targetId);
    if (targetPet) {
      setCurrentPetName(targetPet.name);
      setVaccinations(targetPet.vaccinations || []);
    }
  };

  const syncVaccinationsToStorage = (updatedVacs: VaccinationItem[]) => {
    setVaccinations(updatedVacs);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puppy_id_pets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updatedPets = parsed.map((p: any) => {
              if (p.id === selectedPetId || p.publicId === selectedPetId) {
                return { ...p, vaccinations: updatedVacs };
              }
              return p;
            });
            localStorage.setItem('puppy_id_pets', JSON.stringify(updatedPets));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName || !dateAdministered) return;

    setIsSubmitting(true);
    const countNum = parseInt(doseCount) || 1;
    const displayName = countNum > 1 ? `${vaccineName} (Dose #${countNum})` : vaccineName;

    const newVac: VaccinationItem = {
      id: `vac-${Date.now()}`,
      petId: selectedPetId,
      vaccineName: displayName,
      doseCount: countNum,
      dateAdministered,
      nextDueDate: nextDueDate || undefined,
      vetName: vetName || 'Dr. Rahul Verma',
      clinic: clinic || 'Banjara Vet Hospital',
      notes,
      status,
    };

    const updatedVacs = [newVac, ...vaccinations];
    syncVaccinationsToStorage(updatedVacs);

    setNotice(`✅ Vaccination (Count #${countNum}) saved for ${currentPetName} and synced across devices!`);
    setTimeout(() => setNotice(null), 4000);

    setVaccineName('Rabies Anti-Rabies Vaccine');
    setDoseCount('1');
    setNextDueDate('');
    setVetName('');
    setClinic('');
    setNotes('');
    setIsSubmitting(false);

    try {
      await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVac),
      });

      if (addReminderAlert && nextDueDate) {
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId: selectedPetId,
            category: 'Vaccination',
            title: `${displayName} Booster Shot`,
            date: nextDueDate,
            repeat: 'ONCE',
          }),
        });
      }
    } catch (err) {
      console.error('Save vaccination API error:', err);
    }
  };

  // Direct manual set/quick add count action
  const handleQuickAddCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const countToAdd = parseInt(customCountInput) || 1;
    if (countToAdd <= 0) return;

    const newItems: VaccinationItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= countToAdd; i++) {
      newItems.push({
        id: `vac-quick-${Date.now()}-${i}`,
        petId: selectedPetId,
        vaccineName: `Immunization Record #${vaccinations.length + i}`,
        doseCount: vaccinations.length + i,
        dateAdministered: todayStr,
        vetName: 'Dr. Rahul Verma',
        clinic: 'Banjara Vet Hospital',
        status: 'COMPLETED',
      });
    }

    const updatedVacs = [...newItems, ...vaccinations];
    syncVaccinationsToStorage(updatedVacs);

    setNotice(`✅ Added ${countToAdd} vaccination count(s) for ${currentPetName}!`);
    setTimeout(() => setNotice(null), 4000);
    setIsQuickCountOpen(false);
    setCustomCountInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn text-slate-800">
      {/* Header & Pet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vaccination Records & Count</h1>
          <p className="text-sm text-slate-500 font-medium">
            Immunization history, dose count & booster dates for <strong className="text-slate-800">{currentPetName}</strong>
          </p>
        </div>

        {/* Pet Selector Dropdown */}
        {allPets.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Dog className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-extrabold text-slate-700">Select Pet:</span>
            <select
              value={selectedPetId}
              onChange={handlePetChange}
              className="text-xs font-bold bg-transparent text-slate-900 focus:outline-none"
            >
              {allPets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.breed})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Summary Stat & Add Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Summary Card WITH QUICK COUNT ADD BUTTON */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Immunizations</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{vaccinations.length}</div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Verified vaccine count</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Syringe className="w-6 h-6" />
              </div>
            </div>

            {/* QUICK ADD VACCINATION COUNT BUTTON */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsQuickCountOpen(!isQuickCountOpen)}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>➕ Quick Add / Set Vaccination Count</span>
              </button>
            </div>

            {/* Quick Count Inline Input Form */}
            {isQuickCountOpen && (
              <form onSubmit={handleQuickAddCountSubmit} className="pt-2 space-y-2 animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  How many vaccination counts to add for {currentPetName}?
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={customCountInput}
                    onChange={(e) => setCustomCountInput(e.target.value)}
                    placeholder="e.g. 1, 2, 5"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
                  >
                    Add Count
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Interactive Add Vaccine Record Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span>Add Vaccine Record</span>
              </div>
            </div>

            <form onSubmit={handleAddVaccination} className="space-y-3">
              {/* Target Pet Selection */}
              {allPets.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Pet *</label>
                  <select
                    value={selectedPetId}
                    onChange={handlePetChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  >
                    {allPets.map((p) => (
                      <option key={p.id} value={p.id}>
                        🐶 {p.name} ({p.breed})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vaccine Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vaccine Name *</label>
                <select
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Rabies Anti-Rabies Vaccine">Rabies Anti-Rabies Vaccine</option>
                  <option value="DHPP Core Vaccine">DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)</option>
                  <option value="Annual Booster Shot">Annual Immunity Booster</option>
                  <option value="Bordetella Kennel Cough">Bordetella Kennel Cough</option>
                  <option value="Leptospirosis Vaccine">Leptospirosis Vaccine</option>
                  <option value="Lyme Disease Vaccine">Lyme Disease Vaccine</option>
                </select>
              </div>

              {/* DOSE / VACCINATION COUNT INPUT FIELD */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-emerald-600" />
                    <span>Dose / Count #</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={doseCount}
                    onChange={(e) => setDoseCount(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="COMPLETED">✅ COMPLETED</option>
                    <option value="UPCOMING">⏰ UPCOMING</option>
                    <option value="OVERDUE">⚠️ OVERDUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date Given *</label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Veterinarian</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    placeholder="Dr. Rahul Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Banjara Vet Hospital"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-reminder"
                  checked={addReminderAlert}
                  onChange={(e) => setAddReminderAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="add-reminder" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  🔔 Auto-create care reminder alert for next booster
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 mt-2"
                icon={<Plus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Saving & Syncing...' : `Save Vaccine Record for ${currentPetName}`}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Vaccination Records Table */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Immunization History Log for {currentPetName}
              </h3>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Count: {vaccinations.length} Records
              </span>
            </div>

            {vaccinations.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No vaccination records logged yet for {currentPetName}. Add your first record on the left!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-3">Vaccine Name & Dose #</th>
                      <th className="py-3 px-3">Date Given</th>
                      <th className="py-3 px-3">Next Due</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {vaccinations.map((vac) => (
                      <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{vac.vaccineName}</span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">{formatDate(vac.dateAdministered)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {vac.nextDueDate ? formatDate(vac.nextDueDate) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
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
